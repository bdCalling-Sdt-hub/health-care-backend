import { z } from 'zod';

const createMedicineZodSchema = z.object({
  name: z.string({
    required_error: 'name is required',
    invalid_type_error: 'name should be type string',
  }),
  company: z.string({
    required_error: 'company is required',
    invalid_type_error: 'company should be type string',
  }),
  dosage: z.array(
    z.string({
      required_error: 'dosage is required',
      invalid_type_error: 'dosage should be type string',
    })
  ),
  country: z.string({
    required_error: 'country is required',
    invalid_type_error: 'country should be type string',
  }),
  image: z.string({
    required_error: 'image is required',
    invalid_type_error: 'image should be type string',
  }),
  unitPerBox: z.array(
    z.string({
      required_error: 'unitPerBox is required',
      invalid_type_error: 'unitPerBox should be type string',
    })
  ),
  medicineType: z.string({
    required_error: 'medicineType is required',
    invalid_type_error: 'medicineType should be type string',
  }),
  form: z.string({
    required_error: 'from is required',
    invalid_type_error: 'from should be type string',
  }),
  description: z.string({
    required_error: 'description is required',
    invalid_type_error: 'description should be type string',
  }),
  purchaseCost: z.string({
    required_error: 'purchaseCost is required',
    invalid_type_error: 'purchaseCost should be type string',
  }),
  tax: z.string({
    required_error: 'tax is required',
    invalid_type_error: 'tax should be type string',
  }),
  externalExpenses: z.string({
    required_error: 'externalExpenses is required',
    invalid_type_error: 'externalExpenses should be type string',
  }),
  sellingPrice: z.string({
    required_error: 'sellingPrice is required',
    invalid_type_error: 'sellingPrice should be type string',
  }),
  addedBy: z.string({
    required_error: 'addedBy is required',
    invalid_type_error: 'addedBy should be type objectID or string',
  }),
  category: z.string({
    required_error: 'category is required',
    invalid_type_error: 'category should be type string',
  }),
});

const updateMedicineZodSchema = z.object({
  name: z
    .string({ invalid_type_error: 'name should be type string' })
    .optional(),
  company: z
    .string({ invalid_type_error: 'company should be type string' })
    .optional(),
  dosage: z.array(
    z.string({ invalid_type_error: 'dosage should be type string' }).optional()
  ),
  country: z
    .string({ invalid_type_error: 'country should be type string' })
    .optional(),
  image: z
    .string({ invalid_type_error: 'image should be type string' })
    .optional(),
  unitPerBox: z.array(
    z
      .string({ invalid_type_error: 'unitPerBox should be type string' })
      .optional()
  ),
  medicineType: z
    .string({ invalid_type_error: 'medicineType should be type string' })
    .optional(),
  form: z
    .string({ invalid_type_error: 'from should be type string' })
    .optional(),
  description: z
    .string({ invalid_type_error: 'description should be type string' })
    .optional(),
  purchaseCost: z
    .string({ invalid_type_error: 'purchaseCost should be type string' })
    .optional(),
  tax: z.string({ invalid_type_error: 'tax should be type string' }).optional(),
  externalExpenses: z
    .string({ invalid_type_error: 'externalExpenses should be type string' })
    .optional(),
  sellingPrice: z
    .string({ invalid_type_error: 'sellingPrice should be type string' })
    .optional(),
  addedBy: z
    .string({ invalid_type_error: 'addedBy should be type string' })
    .optional(),
});

export const MedicineValidation = {
  createMedicineZodSchema,
  updateMedicineZodSchema,
};
