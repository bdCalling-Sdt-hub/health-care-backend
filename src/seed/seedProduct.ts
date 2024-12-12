import { Product } from '../app/modules/product/product.model';
import { stripeHelper } from '../helpers/stripeHelper';

export default async function seedProduct() {
  const productData = {
    name: 'Consultation Service',
    description: 'A consultation service to help you get better',
    price: 25,
  };
  const isExistProduct = await Product.findOne({ name: productData.name });
  if (isExistProduct) {
    return {};
  }
  const product = await stripeHelper.createStripeProduct(
    productData.name,
    productData.description,
    productData.price
  );
  if (!product) {
    console.log('Failed to create product');
    return {};
  }
  const createProductToDB = await Product.create({
    ...productData,
    paymentLink: product.paymentLink,
  });
  return createProductToDB;
}
