import Stripe from 'stripe';
import stripe from '../config/stripe';
// Product Related Functions
const createPaymentLink = async (product: Stripe.Product) => {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    payment_method_types: ['card', 'us_bank_account'],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: 'http://medspaceconnect.com',
      },
    },
    custom_fields: [
      {
        key: 'payment_method',
        label: {
          type: 'custom',
          custom: 'Preferred Payment Method',
        },
        type: 'dropdown',
        dropdown: {
          options: [
            { label: 'Credit Card (Visa)', value: 'visa' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
          ],
        },
      },
    ],
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
      currency: 'usd',
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
export const stripeHelper = {
  createCoupon,
  createPromotionCode,
  deleteCoupon,
  createStripeProduct,
};