import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';
import { ObjectId } from 'mongodb';

import { OrderStatus } from '~/constants/enum';
import { ORDERS_MESSAGES } from '~/constants/messages';
import { GetOrdersRequestQuery } from '~/models/requests/Order.requests';
import databaseService from './database.services';

class OrderService {
  // Lấy danh sách đơn hàng (nếu không truyền user_id thì lấy tất cả đơn hàng)
  async getOrders({ query, user_id }: { query: GetOrdersRequestQuery; user_id?: string }) {
    const { page, limit, status } = query;
    // Lọc theo trạng thái
    const _status = Number(status) || undefined;
    // Tạo điều kiện tìm kiếm
    const generateMatch = (status?: OrderStatus) => {
      return omitBy(
        {
          user_id: user_id ? new ObjectId(user_id) : undefined,
          status
        },
        isUndefined
      );
    };
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const [orders, total, new_count, processing_count, delivering_count, succeed_count, canceled_count] =
      await Promise.all([
        databaseService.orders
          .aggregate([
            {
              $match: generateMatch(_status)
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
                status: {
                  $first: '$status'
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
                customer_gender: {
                  $first: '$customer_gender'
                },
                customer_name: {
                  $first: '$customer_name'
                },
                customer_phone: {
                  $first: '$customer_phone'
                },
                transport_fee: {
                  $first: '$transport_fee'
                },
                total_amount_before_discount: {
                  $first: '$total_amount_before_discount'
                },
                total_amount: {
                  $first: '$total_amount'
                },
                total_amount_reduced: {
                  $first: '$total_amount_reduced'
                },
                note: {
                  $first: '$note'
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
            },
            {
              $sort: {
                created_at: -1
              }
            },
            {
              $skip: (_page - 1) * _limit
            },
            {
              $limit: _limit
            }
          ])
          .toArray(),
        databaseService.orders.countDocuments(generateMatch(_status)),
        databaseService.orders.countDocuments(generateMatch(OrderStatus.New)),
        databaseService.orders.countDocuments(generateMatch(OrderStatus.Processing)),
        databaseService.orders.countDocuments(generateMatch(OrderStatus.Delivering)),
        databaseService.orders.countDocuments(generateMatch(OrderStatus.Succeed)),
        databaseService.orders.countDocuments(generateMatch(OrderStatus.Canceled))
      ]);
    const pageSize = Math.ceil(total / _limit);
    return {
      message: ORDERS_MESSAGES.GET_ORDERS_LIST_SUCCEED,
      data: {
        orders,
        quantity: {
          all: total,
          new: new_count,
          processing: processing_count,
          delivering: delivering_count,
          succeed: succeed_count,
          canceled: canceled_count
        },
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
  async getOrder({ order_id, user_id }: { order_id: string; user_id: string }) {
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
            total_amount_before_discount: {
              $first: '$total_amount_before_discount'
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
  async deleteOrder(order_ids: string[]) {
    const _order_ids = order_ids.map((order_id) => new ObjectId(order_id));
    await databaseService.orders.deleteMany({
      _id: {
        $in: _order_ids
      }
    });
    return {
      message: ORDERS_MESSAGES.DELETE_ORDER_SUCCEED
    };
  }
}

const orderService = new OrderService();
export default orderService;
