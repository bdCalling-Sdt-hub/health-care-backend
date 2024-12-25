import { Types, Model } from 'mongoose';
type IQNA = { question: string; answer: string };
export type IConsultation = {
  _id?: Types.ObjectId;
  QNA: Array<IQNA>;
  userId: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  medicins: [Types.ObjectId];
  status?: string;
  doctorId?: Types.ObjectId;
};
export type ConsultationModel = Model<IConsultation>;
