import { Model, Types } from 'mongoose';

export type ISubCategory = {
  name: string;
  category: Types.ObjectId;
  image: string;
  details: string;
};

export type SubCategoryModel = Model<ISubCategory>;
