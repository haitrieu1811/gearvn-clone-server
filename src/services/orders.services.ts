import { GetAllRequestQuery } from '~/models/requests/Order.requests';
import databaseService from './database.services';
import { ORDERS_MESSAGES } from '~/constants/messages';

class OrderService {
  async getAll(query: GetAllRequestQuery) {
    const total = await databaseService.orders.countDocuments();
    const limit = Number(query.limit) || 20;
    const pageSize = Math.ceil(total / limit);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    // const orders = await databaseService.orders.find({}).skip(skip).limit(limit).toArray();
    const orders = await databaseService.orders
      .aggregate([
        {
          $lookup: {
            from: 'purchases',
            localField: 'purchases',
            foreignField: '_id',
            as: 'purchases'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'purchases.product_id',
            foreignField: '_id',
            as: 'purchases'
          }
        },
        {
          $project: {
            user_id: 0,
            status: 0,
            created_at: 0,
            updated_at: 0,
            'purchases._id': 0,
            'purchases.user_id': 0,
            'purchases.status': 0,
            'purchases.general_info': 0,
            'purchases.description': 0,
            'purchases.images': 0,
            'purchases.brand_id': 0,
            'purchases.category_id': 0,
            'purchases.specifications': 0,
            'purchases.created_at': 0,
            'purchases.updated_at': 0
          }
        }
      ])
      .skip(skip)
      .limit(limit)
      .toArray();
    return {
      message: ORDERS_MESSAGES.GET_ALL_ORDERS_SUCCEED,
      data: {
        orders_size: total,
        orders,
        pagination: {
          page,
          limit,
          page_size: pageSize
        }
      }
    };
  }
}

const orderService = new OrderService();
export default orderService;
