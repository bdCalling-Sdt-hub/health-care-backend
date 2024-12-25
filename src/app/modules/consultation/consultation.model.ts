import { Schema, model } from 'mongoose';
import { IConsultation, ConsultationModel } from './consultation.interface';
import { CONSULTATION_TYPE, STATUS } from '../../../enums/consultation';

const consultationSchema = new Schema<IConsultation, ConsultationModel>(
  {
    QNA: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicins: {
      type: [Schema.Types.ObjectId],
      ref: 'Medicine',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      required: false,
      default: STATUS.PENDING,
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
    pdfFile: { type: String, required: false },
    link: { type: String, required: false },
    consultationType: {
      type: String,
      enum: Object.values(CONSULTATION_TYPE),
      required: false,
    },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

export const Consultation = model<IConsultation, ConsultationModel>(
  'Consultation',
  consultationSchema
);
