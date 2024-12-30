import { Model, Types } from 'mongoose';

export type IMedicine = {
  name: string;
  company: string;
  dosage: string;
  country: string;
  image: string;
  unitPerBox: string;
  medicineType: string;
  form: string;
  description: string;
  purchaseCost: number;
  category: Types.ObjectId;
  tax: number;
  externalExpenses: number;
  sellingPrice: number;
  addedBy: Types.ObjectId;
};

export type MedicineModel = Model<IMedicine>;
