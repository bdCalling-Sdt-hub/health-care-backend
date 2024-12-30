import { z } from 'zod';

const createConsultationZodSchema = z.object({
  body: z.object({
    QNA: z.array(
      z.object({
        question: z.string({
          required_error: 'question is required',
          invalid_type_error: 'question should be type string',
        }),
        answer: z.string({
          required_error: 'answer is required',
          invalid_type_error: 'answer should be type string',
        }),
      })
    ),

    medicins: z.array(
      z.string({
        required_error: 'medicins is required',
        invalid_type_error: 'medicins should be type string',
      })
    ),

    doctorId: z
      .string({
        required_error: 'doctorId is required',
        invalid_type_error: 'doctorId should be type string',
      })
      .optional(),
    category: z.string({
      required_error: 'category is required',
      invalid_type_error: 'category should be type string',
    }),
    subCategory: z.string({
      required_error: 'subCategory is required',
      invalid_type_error: 'subCategory should be type string',
    }),
    consultationType: z.string({
      required_error: 'consultationType is required',
      invalid_type_error: 'consultationType should be type string',
    }),
    address: z
      .object({
        firstname: z.string({
          required_error: 'Firstname is required',
          invalid_type_error: 'Firstname should be a string',
        }),
        lastname: z.string({
          required_error: 'Lastname is required',
          invalid_type_error: 'Lastname should be a string',
        }),
        streetAndHouseNo: z.string({
          required_error: 'Street and house number are required',
          invalid_type_error: 'Street and house number should be a string',
        }),
        postalCode: z.string({
          required_error: 'Postal code is required',
          invalid_type_error: 'Postal code should be a string',
        }),
        country: z.string({
          required_error: 'Country is required',
          invalid_type_error: 'Country should be a string',
        }),
        place: z.string({
          required_error: 'Place is required',
          invalid_type_error: 'Place should be a string',
        }),
      })
      .optional(),
  }),
});

export const ConsultationValidation = {
  createConsultationZodSchema,
};
