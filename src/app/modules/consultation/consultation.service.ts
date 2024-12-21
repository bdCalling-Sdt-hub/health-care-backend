import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Consultation } from './consultation.model';
import { IConsultation } from './consultation.interface';
import { ProductService } from './consultationProduct/product.service';
const createConsultation = async (
  payload: IConsultation
): Promise<IConsultation> => {
  const result = await Consultation.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create consultation!'
    );
  }
  const consultationLink = await ProductService.getConsultationLink();

  return consultationLink;
};
export const ConsultationService = {
  createConsultation,
};
