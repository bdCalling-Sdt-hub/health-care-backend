import { Types, Model } from 'mongoose';
type IQNA = { question: string; answer: string };
export type IConsultation = {
  QNA: Array<IQNA>;
  userId: Types.ObjectId;
  medicins: [Types.ObjectId];
  status?: string;
  doctorId?: Types.ObjectId;
};
export type ConsultationModel = Model<IConsultation>;
