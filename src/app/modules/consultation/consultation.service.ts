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
          status: STATUS.DRAFT,
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
  const result = await Consultation.findByIdAndUpdate(id, { $set: payload });
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
    .populate('userId');
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

const rejectConsultation = async (id: string) => {
  const consultation = await getConsultationByID(id);
  const rejectConsultation = await Consultation.findByIdAndUpdate(
    id,
    { status: STATUS.REJECTED },
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
};
