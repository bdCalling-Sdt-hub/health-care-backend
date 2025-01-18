import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Order } from './order.model';
import { IOrder } from './order.interface';
import { Request, Response } from 'express';
import XLSX from 'xlsx';
const createOrder = async (payload: IOrder): Promise<IOrder> => {
  const result = await Order.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create order!');
  }
  return result;
};

const getAllOrders = async (
  queryFields: Record<string, any>
): Promise<IOrder[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { trackingNo: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Order.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found!');
  }
  return result;
};

const updateOrder = async (
  id: string,
  payload: IOrder
): Promise<IOrder | null> => {
  const isExistOrder = await getOrderById(id);
  if (!isExistOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found!');
  }

  const result = await Order.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update order!');
  }
  return result;
};

const deleteOrder = async (id: string): Promise<IOrder | null> => {
  const isExistOrder = await getOrderById(id);
  if (!isExistOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found!');
  }

  const result = await Order.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete order!');
  }
  return result;
};

const importOrders = async (req: Request, res: Response): Promise<IOrder[]> => {
  if (!req?.file?.buffer) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded!');
  }
  const workbook = XLSX.read(req?.file?.buffer, { type: 'buffer' });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const todaysDate = new Date();

  const jsonData: IOrder[] = XLSX.utils.sheet_to_json(worksheet);
  console.log(jsonData);
  const promises = jsonData.map(async (data: IOrder) => {
    const isExistOrder = await Order.findOne({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      price: data.price,
    });
    if (isExistOrder) {
      const order = await Order.findByIdAndUpdate(isExistOrder._id, {
        ...data,
      });
      return order;
    }
    const order = await Order.create({
      ...data,
      orderDate: todaysDate,
      status: 'processing',
    });
    return order;
  });

  const submitAllOrder = await Promise.all(promises);
  return submitAllOrder;
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  importOrders,
};
