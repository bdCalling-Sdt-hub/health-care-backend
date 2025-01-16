import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Consultation } from './consultation.model';
import { IConsultation } from './consultation.interface';
import { stripeHelper } from '../../../helpers/stripeHelper';
import { Types } from 'mongoose';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';
import { CONSULTATION_TYPE, STATUS } from '../../../enums/consultation';
import { populate } from 'dotenv';
import { NotificationService } from '../notification/notification.service';
import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { DoctorService } from '../user/doctor/doctor.service';
import { UserService } from '../user/user.service';
import { HelperService } from '../../../helpers/helper.service';
import { IMedicine } from '../medicine/medicine.interface';
import config from '../../../config';

const createConsultation = async (
  payload: IConsultation,
  userId: string
): Promise<any> => {
  payload.userId = new Types.ObjectId(userId);
  const result = await Consultation.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create consultation!'
    );
  }
  const createCheckOutSession = await stripeHelper.createCheckoutSession(
    userId,
    result._id.toString()
  );

  return createCheckOutSession.url;
};
const createConsultationSuccess = async (
  session_id: string,
  id: string
): Promise<any> => {
  const result = await stripe.checkout.sessions.retrieve(session_id);
  if (result.payment_status === 'paid') {
    const paymentIntentID = result.payment_intent;
    const isExistConsultation = await Consultation.findById(id);
    if (!isExistConsultation) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
    }
    const allDoctors = await User.find({
      subCategory: isExistConsultation.subCategory,
    });
    const selectRandomDoctor =
      allDoctors[Math.floor(Math.random() * allDoctors.length)];
    const updateConsultation = await Consultation.findByIdAndUpdate(
      id,
      {
        $set: {
          doctorId: selectRandomDoctor._id,
          status: STATUS.PENDING,
          paymentIntentID,
        },
      },
      { new: true }
    );
    if (!updateConsultation) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update consultation!'
      );
    }
    return updateConsultation;
  }
  return result;
};
const getMyConsultations = async (userId: string, query: any): Promise<any> => {
  console.log(query);

  const result = await Consultation.find({
    userId: new Types.ObjectId(userId),
    ...query,
  })
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('doctorId')
    .skip(Number(query.limit) * (Number(query.page) - 1));

  console.log('data', result);
  if (!result.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }
  return result;
};

const updateConsultation = async (id: string, payload: any): Promise<any> => {
  const result = await Consultation.findByIdAndUpdate(id, { $set: payload });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update consultation!'
    );
  }
  return result;
};
const prescribeMedicine = async (id: string, payload: any): Promise<any> => {
  const result = await Consultation.findByIdAndUpdate(id, {
    $set: { ...payload, status: STATUS.PRESCRIBED },
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update consultation!'
    );
  }
  return result;
};

const getAllConsultations = async (query: any): Promise<any> => {
  if (query.consultationType) {
    if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
      query.forwardToPartner = true;
    } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
      query.medicins = { $exists: true, $ne: [] };
    }
  }
  const result = await Consultation.find({
    ...query,
  })
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate('doctorId')
    .populate('userId')
    .skip(Number(query.limit || 10) * (Number(query.page || 1) - 1));
  if (!result.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }
  return result;
};
const getConsultationByID = async (id: string): Promise<any> => {
  const result = await Consultation.findById(id)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('doctorId')
    .populate('userId')
    .populate('suggestedMedicine._id')
    .populate('medicins._id');
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }
  return result;
};

const refundByIDFromDB = async (id: string) => {
  const consultation = await Consultation.findById(id);
  if (!consultation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation does not exist');
  }
  const refund = await stripe.refunds.create({
    payment_intent: consultation?.paymentIntentID as string,
  });
  if (!refund) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to process refund!');
  }
  return refund;
};

const rejectConsultation = async (id: string, opinion: string) => {
  const consultation = await getConsultationByID(id);
  const rejectConsultation = await Consultation.findByIdAndUpdate(
    id,
    { status: STATUS.REJECTED, rejectedOpinion: opinion },
    { new: true }
  );
  if (!rejectConsultation) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to reject consultation!'
    );
  }
  const refund = await refundByIDFromDB(id);
  if (!refund) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Could not refund the money'
    );
  }
  await NotificationService.createNotification(
    {
      title: 'Rejected Consultation',
      description:
        'Your consultation request has been rejected by doctor and the money is also successfully refunded to your account.',
      reciever: consultation?.userId,
    },
    //@ts-ignore
    global.io
  );
  return {};
};

const scheduleConsultationToDB = async (data: IConsultation, id: string) => {
  const consultation = await getConsultationByID(id);
  await updateConsultation(id, data);
  //@ts-ignore
  const io = global.io;
  await NotificationService.createNotification(
    {
      title: `Your consultation on ${consultation.subCategory.name} is scheduled`,
      description: `Your consultation on ${
        consultation.subCategory.name
      } with doctor ${
        consultation.userId.name
      } was scheduled on ${data?.scheduledDate?.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      reciever: consultation.userId._id,
    },
    io
  );
  return {
    message: 'consultation scheduled successfully',
  };
};

const addLinkToConsultation = async (data: IConsultation, id: string) => {
  const consultation = await getConsultationByID(id);
  await updateConsultation(id, data);
  //@ts-ignore
  const io = global.io;
  await NotificationService.createNotification(
    {
      title: `Doctor ${consultation.doctorId.name} sent a meeting link for consultation`,
      description: `Doctor ${consultation.doctorId.name} sent a meeting link for consultation on ${consultation.subCategory.name}`,
      reciever: consultation.userId._id,
    },
    io
  );
  return {
    message: 'consultation scheduled successfully',
  };
};

const withdrawDoctorMoney = async (id: string) => {
  const doctor = await User.findById(id);
  const allDoctorConsultation = await Consultation.countDocuments({
    status: 'accepted',
    doctorId: id,
  });
  const totalAmount = 25 * allDoctorConsultation * 0.15;
  const teacherStripeAccountId = doctor?.accountInformation?.stripeAccountId;
  if (!teacherStripeAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher payment not setup');
  }
  const transfer = await stripe.transfers.create({
    amount: totalAmount * 100,
    currency: 'usd',
    destination: teacherStripeAccountId,
  });

  if (!transfer) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to transfer money!');
  }

  return {};
};

const buyMedicine = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }
  const isExistConsultation = await getConsultationByID(id);
  const allMedicinsPrice = isExistConsultation.suggestedMedicine
    .map((medicine: any) => {
      return {
        price: medicine?._id?.sellingPrice
          ? medicine?._id?.sellingPrice * medicine.count
          : 0,
      };
    })
    .reduce((prev: number, current: any) => prev + current.price, 0);
  await Consultation.findByIdAndUpdate(id, {
    totalAmount: allMedicinsPrice,
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Consultation service Medicins.',
            description: 'Prescription medicins',
          },
          unit_amount: allMedicinsPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://${config.ip_address}:${config.port}/api/v1/consultation/buySuccess?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
    cancel_url: `http://${process.env.FRONTEND}/profile`,
    metadata: {
      userId,
    },
  });
  return session.url;
};
const buyMedicineSuccess = async (
  session_id: string,
  id: string,
  res: Response
) => {
  const todaysDate = new Date();
  const session = await stripe.checkout.sessions.retrieve(session_id);
  const isExistConsultation = await getConsultationByID(id);
  if (session?.payment_status === 'paid') {
    await Consultation.findByIdAndUpdate(isExistConsultation._id, {
      $set: {
        paid: true,
        paymentIntentID: session.payment_intent,
        orderDate: todaysDate,
        status: 'processing',
      },
    });
  }
  return res.redirect(`http://${process.env.FRONTEND}/profile`);
};
export const ConsultationService = {
  createConsultation,
  createConsultationSuccess,
  getMyConsultations,
  updateConsultation,
  prescribeMedicine,
  getAllConsultations,
  getConsultationByID,
  refundByIDFromDB,
  rejectConsultation,
  scheduleConsultationToDB,
  addLinkToConsultation,
  withdrawDoctorMoney,
  buyMedicine,
  buyMedicineSuccess,
};
