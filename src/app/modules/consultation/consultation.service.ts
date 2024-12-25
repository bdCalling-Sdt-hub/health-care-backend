import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Consultation } from './consultation.model';
import { IConsultation } from './consultation.interface';
import { stripeHelper } from '../../../helpers/stripeHelper';
import { Types } from 'mongoose';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';

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
    const isExistConsultation = await Consultation.findById(id);
    if (!isExistConsultation) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Consultation not found!');
    }
    const allDoctors = await User.find({
      subCategory: isExistConsultation.subCategory,
    });
    const selectRandomDoctor =
      allDoctors[Math.floor(Math.random() * allDoctors.length)];
    const updateConsultation = await Consultation.findByIdAndUpdate(id, {
      $set: { doctorId: selectRandomDoctor._id },
    });
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

export const ConsultationService = {
  createConsultation,
  createConsultationSuccess,
};
