import { Types, Model } from 'mongoose';
type IQNA = { question: string; answer: string };
export type IMedicineItem = {
  _id: Types.ObjectId;
  count: number;
  total: string;
};
export type IConsultation = {
  _id?: Types.ObjectId;
  QNA: Array<IQNA>;
  userId: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  medicins?: [IMedicineItem];
  consultationType?: string;
  pdfFile: string;
  link?: string;
  status?: string;
  doctorId?: Types.ObjectId;
  suggestedMedicine?: [IMedicineItem];
  opinion?: string;
  address?: {
    firstname: string;
    lastname: string;
    streetAndHouseNo: string;
    postalCode: string;
    country: string;
    place: string;
  };
};
export type ConsultationModel = Model<IConsultation>;
