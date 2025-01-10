import { Model, Types } from 'mongoose';
  
  export type IQuestion = {
    question: string;
  isComment: boolean;
  subCategory: Types.ObjectId
  };
  
  export type QuestionModel = Model<IQuestion>;
