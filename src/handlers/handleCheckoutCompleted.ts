import Stripe from 'stripe';
import stripe from '../config/stripe';
import { User } from '../app/modules/user/user.model';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../enums/user';

export const handleCheckoutCompleted = async (data: Stripe.Subscription) => {
  try {
    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(data.id);

    // Retrieve the customer associated with the subscription
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;

    // Extract the price ID from the subscription items
    const productId = subscription.items.data[0].plan.product as string;

    // Retrieve the invoice to get the transaction ID and amount paid
    const invoice = await stripe.invoices.retrieve(
      subscription.latest_invoice as string
    );

    const trxId = invoice?.payment_intent;
    const amountPaid = invoice?.total / 100;

    if (customer?.email) {
      // Find the user by email
      const existingUser = await User.findOne({ email: customer?.email });
    } else {
      // No email found for the customer
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No email found for the customer!'
      );
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while processing the subscription.'
    );
  }
};
