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
    userId: z.string({
      required_error: 'userId is required',
      invalid_type_error: 'userId should be type string',
    }),
    medicins: z.array(
      z.string({
        required_error: 'medicins is required',
        invalid_type_error: 'medicins should be type string',
      })
    ),
    status: z
      .string({
        required_error: 'status is required',
        invalid_type_error: 'status should be type string',
      })
      .optional(),
    doctorId: z
      .string({
        required_error: 'doctorId is required',
        invalid_type_error: 'doctorId should be type string',
      })
      .optional(),
  }),
});

export const ConsultationValidation = {
  createConsultationZodSchema,
};
