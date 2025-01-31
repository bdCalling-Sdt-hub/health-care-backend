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
import { Order } from '../order/order.model';
import { USER_ROLES } from '../../../enums/user';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

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
  const consultation: any = await Consultation.findById(id)
    .populate('userId')
    .populate('subCategory')
    .populate('doctorId');
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
    let selectRandomDoctor: any =
      allDoctors[Math.floor(Math.random() * allDoctors.length)];
    if (!selectRandomDoctor) {
      selectRandomDoctor = await User.findOne({ role: USER_ROLES.DOCTOR });
    }
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
    //@ts-ignore
    const io = global.io;
    await NotificationService.createNotification(
      {
        title: `A new consultation request by ${consultation?.userId?.firstName}`,
        description: `A new consultation request by ${consultation?.userId?.firstName} on ${consultation?.subCategory?.name}`,

        reciever: selectRandomDoctor._id,
      },
      io
    );
    await emailHelper.sendEmail({
      to: consultation.userId.email,
      subject:
        'Dear customer, we thank you very much for your trust and payment.',
      html: emailTemplate.sendNotification({
        email: consultation.userId.email,
        name: consultation?.userId?.firstName || 'Unknown',
        message: `Dear customer, we thank you very much for your trust and payment. 
Your answers are sent to the doctor. Based on this, the doctor will decide what the best treatment is for you. If this results in a prescription, you will receive a message from the pharmacy that a prescription is ready for you with the next steps. If you have any questions in the meantime, please do not hesitate to ask us (support@dokterforyou.com). Kind regards, team Doctor For You`,
      }).html,
    });
    return updateConsultation;
  }

  return result;
};
const getMyConsultations = async (userId: string, query: any): Promise<any> => {
  const searchQuery = {
    userId: new Types.ObjectId(userId),
    status: { $in: ['accepted', 'processing'] },
  };
  if (query.consultationType) {
    if (query.consultationType === CONSULTATION_TYPE.FORWARDTO) {
      //@ts-ignore
      searchQuery?.forwardToPartner = true;
    } else if (query.consultationType === CONSULTATION_TYPE.MEDICATION) {
      //@ts-ignore
      searchQuery?.medicins = { $exists: true, $ne: [] };
    }
  }
  const result = await Consultation.find(searchQuery)
    .populate('category')
    .populate('subCategory')
    .populate('medicins._id')
    .populate('suggestedMedicine._id')
    .populate('doctorId')
    .skip(Number(query.limit) * (Number(query.page) - 1));

  if (!result.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
  }
  return result;
};

const updateConsultation = async (id: string, payload: any): Promise<any> => {
  const consultation: any = await Consultation.findById(id)
    .populate('userId')
    .populate('subCategory')
    .populate('doctorId');
  if (payload.status === 'accepted') {
    await emailHelper.sendEmail({
      to: consultation.userId.email,
      subject:
        'Dear customer, your doctor has written you a prescription after your consultation.',
      html: emailTemplate.sendNotification({
        email: consultation.userId.email,
        name: consultation?.userId?.firstName || 'Unknown',
        message: ` A copy of this prescription can be found as attachment for your own administration. At your account at Dokterforyou.com you can find the paymentlink for the medication. If you make the payment before 3:00 PM on workdays, your prescription will be processed immediately by the pharmacy and you will receive your medication at home the next working day. If you have any questions in the meantime, please do not hesitate to mail us (support@dokterforyou.com). Kind regards, team Dokter For You`,
      }).html,
    });
  }
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
  const consultation: any = getConsultationByID(id);
  const result = await Consultation.findByIdAndUpdate(id, {
    $set: { ...payload, status: STATUS.PRESCRIBED },
  });
  const doctor = await User.findById(result?.doctorId);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update consultation!'
    );
  }
  const allMedicinsPrice = consultation.suggestedMedicine
    .map((medicine: any) => {
      const totals = Number(medicine.total);
      return {
        price: medicine?._id?.sellingPrice
          ? medicine?._id?.sellingPrice * totals * medicine.count * 100
          : 0,
      };
    })
    .reduce((prev: number, current: any) => prev + current.price, 0);
  await Consultation.findByIdAndUpdate(id, {
    totalAmount: allMedicinsPrice / 100,
  });
  const isExistPharmecy = await User.find({ role: USER_ROLES.PHARMACY });
  if (isExistPharmecy) {
    await NotificationService.createNotification(
      {
        title: `A new prescription request by ${doctor?.firstName}`,
        description: `A new prescription request by ${doctor?.firstName}.`,
        reciever: isExistPharmecy[0]?._id,
      },
      // @ts-ignore
      global.io
    );
    await emailHelper.sendEmail({
      to: consultation.userId.email,
      subject:
        'Dear customer, we thank you very much for your trust and payment.',
      html: emailTemplate.sendNotification({
        email: consultation.userId.email,
        name: consultation?.userId?.firstName || 'Unknown',
        message: `Dear customer, the doctor has left a prescription for you in your account. You can login now on dokterforyou.com. Beware that your prescription is valid for 7 days and that you can use it just one time. We thank you for your trust and look forward to see you back on our website. If you have any questions in the meantime, please do not hesitate to ask us (support@dokterforyou.com). Kind regards, team Doctor For You`,
      }).html,
    });
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
    status: {
      $in: query.status || [
        'pending',
        'processing',
        'prescribed',
        'accepted',
        'rejected',
        'delivered',
      ],
    },
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
  const totalPrice =
    result?.suggestedMedicine?.reduce(
      //@ts-ignore
      (acc, curr) => acc + (curr?._id?.sellingPrice || 0),
      0
    ) || 0;
  //@ts-ignore
  const finalResult = { ...result._doc, totalPrice };
  return finalResult;
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
        consultation.doctorId.firstName
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
      title: `Doctor ${consultation.doctorId.fileName} sent a meeting link for consultation`,
      description: `Doctor ${consultation.doctorId.firstName} sent a meeting link for consultation on ${consultation.subCategory.name}`,
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
    withrawn: { $ne: true },
  });
  const totalAmount = 25 * allDoctorConsultation * 0.15;
  if (totalAmount === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No money to withdraw');
  }
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
  const todaysDate = new Date();
  await Consultation.findByIdAndUpdate(id, {
    withrawn: true,
    withdrawnDate: todaysDate,
  });
  return {};
};

const buyMedicine = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }
  const isExistConsultation = await getConsultationByID(id);
  let allMedicinsPrice = 0;
  if (!isExistConsultation.totalAmount) {
    allMedicinsPrice = isExistConsultation.suggestedMedicine
      .map((medicine: any) => {
        const totals = Number(medicine.total);
        return {
          price: medicine?._id?.sellingPrice
            ? medicine?._id?.sellingPrice * totals * medicine.count * 100 + 20
            : 0,
        };
      })
      .reduce((prev: number, current: any) => prev + current.price, 0);
    await Consultation.findByIdAndUpdate(id, {
      totalAmount: allMedicinsPrice,
    });
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Consultation service Medicins.',
            description: 'Prescription medicins',
          },
          unit_amount:
            Math.round(isExistConsultation.totalAmount || allMedicinsPrice) *
              100 +
            20,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://${config.ip_address}:${config.port}/api/v1/consultation/buySuccess?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
    cancel_url: `${process.env.FRONTEND}/profile`,
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
  await Order.create({
    address: `${isExistConsultation.address.streetAndHouseNo}, ${isExistConsultation.address.place}, ${isExistConsultation.address.country}`,
    name: `${isExistConsultation.userId.firstName} ${isExistConsultation.userId.lastName}`,
    email: isExistConsultation.userId.email || 'N/A',
    phone: isExistConsultation.userId.contact || 'N/A',
    company: 'Apotheek Zaandam Oost',
    country: 'Netherlands',
    orderDate: todaysDate,
    city: isExistConsultation.address.place,
    price: isExistConsultation.totalAmount,
    zipCode:
      isExistConsultation.address.postalCode ||
      isExistConsultation.userId.postcode ||
      'N/A',
    trackingNo: '____',
    status: 'processing',
  });

  await emailHelper.sendEmail({
    to: isExistConsultation.userId.email,
    subject:
      'Dear customer, we thank you very much for your trust and payment.',
    html: emailTemplate.sendNotification({
      email: isExistConsultation.userId.email,
      name: isExistConsultation?.userId?.firstName || 'Unknown',
      message: `Dear customer, we thank you very much for your trust and payment. 
If you make the payment before 3:00 PM on workdays, your prescription will be processed immediately by the pharmacy and you will receive your medication at home the next working day. If you have any questions in the meantime, please do not hesitate to mail us (support@dokterforyou.com). Kind regards, team Dokter For You`,
    }).html,
  });
  return res.redirect(`${process.env.FRONTEND}/profile`);
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
