import { z } from 'zod';

const createDiscountZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),
    code: z.string({
      required_error: 'code is required',
      invalid_type_error: 'code should be type string',
    }),
    startDate: z.string({
      required_error: 'startDate is required',
      invalid_type_error: 'startDate should be type string',
    }),
    endDate: z.string({
      required_error: 'endDate is required',
      invalid_type_error: 'endDate should be type string',
    }),
    rate: z.number({
      required_error: 'rate is required',
      invalid_type_error: 'rate should be type number',
    }),
  }),
});

const updateDiscountZodSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'name should be type string' })
      .optional(),
    code: z
      .string({ invalid_type_error: 'code should be type string' })
      .optional(),
    startDate: z
      .string({ invalid_type_error: 'startDate should be type string' })
      .optional(),
    endDate: z
      .string({ invalid_type_error: 'endDate should be type string' })
      .optional(),
    rate: z
      .number({ invalid_type_error: 'rate should be type number' })
      .optional(),
  }),
});

export const DiscountValidation = {
  createDiscountZodSchema,
  updateDiscountZodSchema,
};
