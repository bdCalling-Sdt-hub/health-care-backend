import { z } from 'zod';

const sendNotificationZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be string',
    }),
    description: z
      .string({ invalid_type_error: 'Description must be string' })
      .optional(),
    recieverId: z.string({
      required_error: 'reciever id is required',
      invalid_type_error: 'reciever id should be string',
    }),
  }),
});

export const NotificationValidation = {
  sendNotificationZodSchema,
};
