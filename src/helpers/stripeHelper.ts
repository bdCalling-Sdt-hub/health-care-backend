import Stripe from 'stripe';
import stripe from '../config/stripe';
import fs from 'fs';
import path from 'path';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
const createCheckoutSession = async (userId: string, id: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Consultation service.',
            description: 'Consultation service from dokter for you',
          },
          unit_amount: 2500,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND}/profile?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
    cancel_url: `${process.env.FRONTEND}/checkout/cancel`,
    metadata: {
      userId,
    },
  });
  return session;
};
const createPaymentLink = async (product: Stripe.Product) => {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1,
      },
    ],
    payment_method_types: ['card'],
  });

  return paymentLink.url;
};
const createStripeProduct = async (
  name: string,
  description: string = 'Another medspace connect package',
  price: number
) => {
  const product: Stripe.Product = await stripe.products.create({
    name,
    description,
    default_price_data: {
      currency: 'eur',
      unit_amount: price * 100,
    },
  });

  const paymentLink = await createPaymentLink(product);
  return {
    ...product,
    priceId: product.default_price as string,
    paymentLink,
  };
};

// Coupon Related Functions
const createCoupon = async (
  percent_off: number,
  max_redemptions: number,
  redeem_by: number
) => {
  try {
    const coupon = await stripe.coupons.create({
      percent_off,
      duration: 'once',
      max_redemptions,
      redeem_by,
    });
    return coupon;
  } catch (error) {
    console.error('Coupon creation error:', error);
    throw error;
  }
};
const createPromotionCode = async (couponId: string, name: string) => {
  const promotionCode = await stripe.promotionCodes.create({
    coupon: couponId,
    code: name,
  });

  return promotionCode;
};
const deleteCoupon = async (couponId: string) => {
  try {
    const deletedCoupon = await stripe.coupons.del(couponId);
    return deletedCoupon;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

const uploadFileToStripe = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    let mimeType: string;
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    const file = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fileBuffer,
        name: fileName,
        type: mimeType,
      },
    });
    return file.id;
  } catch (error) {
    console.error('Error uploading file to Stripe:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to upload file to Stripe'
    );
  }
};

export const stripeHelper = {
  createCoupon,
  createPromotionCode,
  deleteCoupon,
  createStripeProduct,
  createCheckoutSession,
};
