import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';

import { GetOrdersRequestQuery } from '~/models/requests/Order.requests';
import databaseService from './database.services';
import { ORDERS_MESSAGES } from '~/constants/messages';
import { OrderStatus } from '~/constants/enum';

class OrderService {
  // Lấy tất cả thông tin đơn hàng
  async getAll(query: GetOrdersRequestQuery) {
    const { page, limit } = query;
    const _limit = limit ? Number(limit) : 10;
    const _page = page ? Number(page) : 1;
    const [orders, total] = await Promise.all([
      databaseService.orders
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
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
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
              'purchases.updated_at': 0,
              'user.password': 0,
              'user.status': 0,
              'user.role': 0,
              'user.verify': 0,
              'user.addresses': 0,
              'user.email_verify_token': 0,
              'user.forgot_password_token': 0
            }
          }
        ])
        .skip((_page - 1) * _limit)
        .limit(_limit)
        .toArray(),
      databaseService.orders.countDocuments()
    ]);
    const page_size = Math.ceil(total / _limit);
    return {
      message: ORDERS_MESSAGES.GET_ALL_ORDERS_SUCCEED,
      data: {
        orders,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size
        }
      }
    };
  }

  // Lấy thông tin đơn hàng của tài khoản đang đăng nhập
  async getList({ query, user_id }: { query: GetOrdersRequestQuery; user_id: string }) {
    const { page, limit, status } = query;
    // Lọc theo trạng thái
    const _status = Number(status) ? Number(status) : undefined;
    const $match = omitBy(
      {
        user_id: new ObjectId(user_id),
        status: _status
      },
      isUndefined
    );
    // Phân trang
    const _page = page ? Number(page) : 1;
    const _limit = limit ? Number(limit) : 10;
    const [total, orders] = await Promise.all([
      databaseService.orders.countDocuments($match),
      databaseService.orders
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'purchases',
              localField: 'purchases',
              foreignField: '_id',
              as: 'purchases'
            }
          },
          {
            $unwind: '$purchases'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'purchases.product_id',
              foreignField: '_id',
              as: 'purchases.product'
            }
          },
          {
            $unwind: '$purchases.product'
          },
          {
            $group: {
              _id: '$_id',
              status: {
                $first: '$status'
              },
              total_amount: {
                $first: '$total_amount'
              },
              purchases: {
                $push: '$purchases'
              },
              created_at: {
                $first: '$created_at'
              },
              updated_at: {
                $first: '$updated_at'
              }
            }
          },
          {
            $project: {
              'purchases.product_id': 0,
              'purchases.user_id': 0,
              'purchases.created_at': 0,
              'purchases.updated_at': 0,
              'purchases.status': 0,
              'purchases.product.general_info': 0,
              'purchases.product.description': 0,
              'purchases.product.images': 0,
              'purchases.product.brand_id': 0,
              'purchases.product.category_id': 0,
              'purchases.product.specifications': 0,
              'purchases.product.user_id': 0
            }
          }
        ])
        .sort({ created_at: -1 })
        .skip((_page - 1) * _limit)
        .limit(_limit)
        .toArray()
    ]);
    const pageSize = Math.ceil(total / _limit);
    return {
      message: ORDERS_MESSAGES.GET_ORDERS_LIST_SUCCEED,
      data: {
        orders,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: pageSize
        }
      }
    };
  }

  // Lấy thông tin chi tiết đơn hàng
  async getDetail({ order_id, user_id }: { order_id: string; user_id: string }) {
    const order = await databaseService.orders
      .aggregate([
        {
          $match: {
            _id: new ObjectId(order_id),
            user_id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'purchases',
            localField: 'purchases',
            foreignField: '_id',
            as: 'purchases'
          }
        },
        {
          $unwind: {
            path: '$purchases'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'purchases.product_id',
            foreignField: '_id',
            as: 'purchases.product'
          }
        },
        {
          $unwind: {
            path: '$purchases.product'
          }
        },
        {
          $group: {
            _id: '$_id',
            purchases: {
              $push: '$purchases'
            },
            customer_gender: {
              $first: '$customer_gender'
            },
            customer_name: {
              $first: '$customer_name'
            },
            customer_phone: {
              $first: '$customer_phone'
            },
            province: {
              $first: '$province'
            },
            district: {
              $first: '$district'
            },
            ward: {
              $first: '$ward'
            },
            street: {
              $first: '$street'
            },
            note: {
              $first: '$note'
            },
            transport_fee: {
              $first: '$transport_fee'
            },
            total_amount: {
              $first: '$total_amount'
            },
            total_amount_reduced: {
              $first: '$total_amount_reduced'
            },
            total_items: {
              $first: '$total_items'
            },
            receive_method: {
              $first: '$receive_method'
            },
            payment_method: {
              $first: '$payment_method'
            },
            status: {
              $first: '$status'
            },
            created_at: {
              $first: '$created_at'
            },
            updated_at: {
              $first: '$updated_at'
            }
          }
        },
        {
          $project: {
            'purchases.product_id': 0,
            'purchases.user_id': 0,
            'purchases.created_at': 0,
            'purchases.updated_at': 0,
            'purchases.status': 0,
            'purchases.product.general_info': 0,
            'purchases.product.description': 0,
            'purchases.product.images': 0,
            'purchases.product.brand_id': 0,
            'purchases.product.category_id': 0,
            'purchases.product.specifications': 0,
            'purchases.product.user_id': 0
          }
        }
      ])
      .toArray();
    return {
      message: ORDERS_MESSAGES.GET_ORDER_DETAIL_SUCCEED,
      data: {
        order: order[0]
      }
    };
  }

  // Lấy số lượng đơn hàng
  async GetQuantity(user_id: string) {
    const [qty_all, qty_new, qty_processing, qty_delivering, qty_succeed, qty_cancelled] = await Promise.all([
      databaseService.orders.countDocuments({
        user_id: new ObjectId(user_id)
      }),
      databaseService.orders.countDocuments({
        user_id: new ObjectId(user_id),
        status: OrderStatus.New
      }),
      databaseService.orders.countDocuments({
        user_id: new ObjectId(user_id),
        status: OrderStatus.Processing
      }),
      databaseService.orders.countDocuments({
        user_id: new ObjectId(user_id),
        status: OrderStatus.Delivering
      }),
      databaseService.orders.countDocuments({
        user_id: new ObjectId(user_id),
        status: OrderStatus.Succeed
      }),
      databaseService.orders.countDocuments({
        user_id: new ObjectId(user_id),
        status: OrderStatus.Cancelled
      })
    ]);
    return {
      message: ORDERS_MESSAGES.GET_ORDERS_QUANTITY_SUCCEED,
      data: {
        qty_all,
        qty_new,
        qty_processing,
        qty_delivering,
        qty_succeed,
        qty_cancelled
      }
    };
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus({ status, order_id }: { status: OrderStatus; order_id: string }) {
    await databaseService.orders.updateOne(
      {
        _id: new ObjectId(order_id)
      },
      {
        $set: {
          status
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: ORDERS_MESSAGES.UPDATE_ORDER_STATUS_SUCCEED
    };
  }

  // Xóa đơn hàng
  async deleteOrder(order_id: string) {
    await databaseService.orders.deleteOne({ _id: new ObjectId(order_id) });
    return {
      message: ORDERS_MESSAGES.DELETE_ORDER_SUCCEED
    };
  }
}

const orderService = new OrderService();
export default orderService;
