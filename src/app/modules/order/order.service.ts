import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Order } from './order.model';
import { IOrder } from './order.interface';
import { Request, Response } from 'express';
import XLSX from 'xlsx';
import { User } from '../user/user.model';
import { NotificationService } from '../notification/notification.service';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

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

const importOrders = async (req: Request, res: Response): Promise<any[]> => {
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
        orderDate: todaysDate,
        status: 'delivered',
      });
      //@ts-ignore
      const io = global.io;
      const user = await User.findOne({ email: data.email });
      if (user) {
        await NotificationService.createNotification(
          {
            title: 'Your meicine order is delivered',
            description: `Your order for medicines is delivered to ${data.address}`,
            reciever: user._id,
          },
          io
        );
      }

      await emailHelper.sendEmail({
        to: data.email,
        subject: 'Your order is delivered',
        html: emailTemplate.sendNotification({
          email: data.email,
          name: user?.firstName || 'Unknown',
          message: `Your order for medicines is delivered and your DHL tracking number is ${data.trackingNo} please check DHL for more information`,
        }).html,
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

const exportOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    // Fetch orders from database
    const orders = await Order.find({});

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(orders);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Format date for filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `orders_${date}.xlsx`;

    // IMPORTANT: Send headers BEFORE sending the file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Length', buffer.length);

    // Additional headers to force download
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Use res.end() instead of res.send() for binary data
    return res.end(buffer);
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ error: 'Failed to export orders' });
  }
};
export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  importOrders,
  exportOrders,
};
