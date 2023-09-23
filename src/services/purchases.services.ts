import { ObjectId, WithId } from 'mongodb';

import { PurchaseStatus } from '~/constants/enum';
import { PURCHASES_MESSAGES } from '~/constants/messages';
import {
  AddToCartRequestBody,
  CheckoutRequestBody,
  UpdatePurchaseRequestBody
} from '~/models/requests/Purchase.requests';
import Order from '~/models/schemas/Order.schema';
import Product from '~/models/schemas/Product.schema';
import Purchase from '~/models/schemas/Purchase.schema';
import databaseService from './database.services';

class PurchaseService {
  // Thêm sản phẩm vào giỏ hàng
  async addToCart({ payload, user_id }: { payload: AddToCartRequestBody; user_id: string }) {
    const { product_id, buy_count } = payload;
    // Điều kiện kiểm tra sản phẩm có tồn tại hay không
    const match = {
      product_id: new ObjectId(product_id),
      user_id: new ObjectId(new ObjectId(user_id)),
      status: PurchaseStatus.InCart
    };
    const [purchase, product] = await Promise.all([
      databaseService.purchases.findOne(match),
      databaseService.products.findOne({
        _id: new ObjectId(product_id)
      })
    ]);
    let purchase_id: ObjectId;
    if (purchase) {
      await databaseService.purchases.updateOne(match, {
        $set: {
          buy_count: purchase.buy_count + buy_count
        },
        $currentDate: {
          updated_at: true
        }
      });
      purchase_id = (purchase as WithId<Purchase>)._id;
    } else {
      const { insertedId } = await databaseService.purchases.insertOne(
        new Purchase({
          product_id: new ObjectId(product_id),
          user_id: new ObjectId(user_id),
          buy_count,
          unit_price: (product as WithId<Product>).price,
          unit_price_after_discount: (product as WithId<Product>).price_after_discount
        })
      );
      purchase_id = insertedId;
    }
    return {
      message: PURCHASES_MESSAGES.ADD_TO_CART_SUCCEED,
      data: {
        purchase_id
      }
    };
  }

  // Lấy thông tin giỏ hàng
  async getCartList(user_id: string) {
    const result = await databaseService.purchases
      .aggregate([
        {
          $match: {
            user_id: { $eq: new ObjectId(user_id) },
            status: { $eq: PurchaseStatus.InCart }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $addFields: {
            product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $project: {
            product_id: 0,
            user_id: 0,
            'product.general_info': 0,
            'product.description': 0,
            'product.images': 0,
            'product.brand_id': 0,
            'product.category_id': 0,
            'product.user_id': 0
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ])
      .toArray();
    return {
      message: PURCHASES_MESSAGES.GET_CART_LIST_SUCCEED,
      data: {
        cart_size: result.length,
        cart_list: result
      }
    };
  }

  // Cập nhật sản phẩm trong giỏ hàng
  async updatePurchase({ payload, purchase_id }: { payload: UpdatePurchaseRequestBody; purchase_id: string }) {
    const { buy_count } = payload;
    await databaseService.purchases.updateOne(
      {
        _id: new ObjectId(purchase_id)
      },
      {
        $set: {
          buy_count
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: PURCHASES_MESSAGES.UPDATE_PURCHASE_SUCCEED
    };
  }

  // Xóa sản phẩm trong giỏ hàng
  async deletePurchase(purchase_ids: ObjectId[]) {
    const dataDelete = purchase_ids.map((id) => new ObjectId(id));
    await databaseService.purchases.deleteMany({
      _id: {
        $in: dataDelete
      }
    });
    return {
      message: `Xóa ${purchase_ids.length} sản phẩm thành công`
    };
  }

  // Xóa tất cả giỏ hàng
  async deleteAllPurchase(user_id: string) {
    await databaseService.purchases.deleteMany({
      user_id: new ObjectId(user_id),
      status: PurchaseStatus.InCart
    });
    return {
      message: PURCHASES_MESSAGES.DELETE_ALL_PURCHASE_SUCCEED
    };
  }

  // Đặt hàng
  async checkout(payload: CheckoutRequestBody, user_id: string) {
    const { purchases } = payload;
    const _purchases = purchases.map((id) => new ObjectId(id));
    const [{ insertedId }] = await Promise.all([
      databaseService.orders.insertOne(
        new Order({
          ...payload,
          user_id
        })
      ),
      databaseService.purchases.updateMany(
        {
          _id: {
            $in: _purchases
          }
        },
        {
          $set: {
            status: PurchaseStatus.Ordered
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ]);
    return {
      message: PURCHASES_MESSAGES.CHECKOUT_SUCCEED,
      data: {
        order_id: insertedId
      }
    };
  }
}

const purchaseService = new PurchaseService();
export default purchaseService;
