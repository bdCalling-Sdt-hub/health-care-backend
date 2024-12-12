import { z } from 'zod';
        
  const createProductZodSchema = z.object({
    body: z.object({
      paymentLink: z.string({ required_error:"paymentLink is required", invalid_type_error:"paymentLink should be type string" }),
      name: z.string({ required_error:"name is required", invalid_type_error:"name should be type string" }),
      description: z.string({ required_error:"description is required", invalid_type_error:"description should be type string" }),
      price: z.string({ required_error:"price is required", invalid_type_error:"price should be type string" })
    }),
  });
  
  const updateProductZodSchema = z.object({
    body: z.object({
      paymentLink: z.string({ invalid_type_error:"paymentLink should be type string" }).optional(),
      name: z.string({ invalid_type_error:"name should be type string" }).optional(),
      description: z.string({ invalid_type_error:"description should be type string" }).optional(),
      price: z.string({ invalid_type_error:"price should be type string" }).optional()
    }),
  });
  
  export const ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema
  };
