import { ObjectId } from 'mongodb';

import { PurchaseStatus } from '~/constants/enum';
import { PURCHASES_MESSAGES } from '~/constants/messages';
import { AddToCartRequestBody, UpdatePurchaseRequestBody } from '~/models/requests/Purchase.requests';
import Order, { OrderAddress } from '~/models/schemas/Order.schema';
import Purchase from '~/models/schemas/Purchase.schema';
import databaseService from './database.services';

class PurchaseService {
  async addToCart({ payload, user_id }: { payload: AddToCartRequestBody; user_id: string }) {
    const { product_id, buy_count } = payload;
    const purchase = await databaseService.purchases.findOne({
      product_id: new ObjectId(product_id),
      user_id: new ObjectId(new ObjectId(user_id)),
      status: PurchaseStatus.InCart
    });
    if (purchase) {
      await databaseService.purchases.updateOne(
        {
          product_id: new ObjectId(product_id),
          user_id: new ObjectId(new ObjectId(user_id))
        },
        {
          $set: {
            buy_count: purchase.buy_count + buy_count
          },
          $currentDate: {
            updated_at: true
          }
        }
      );
    } else {
      await databaseService.purchases.insertOne(
        new Purchase({
          buy_count,
          product_id: new ObjectId(product_id),
          user_id: new ObjectId(user_id)
        })
      );
    }
    return {
      message: PURCHASES_MESSAGES.ADD_TO_CART_SUCCEED
    };
  }

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
            'product._id': 0,
            'product.general_info': 0,
            'product.description': 0,
            'product.images': 0,
            'product.brand_id': 0,
            'product.category_id': 0,
            'product.specifications': 0,
            'product.user_id': 0
          }
        }
      ])
      .toArray();
    return {
      message: PURCHASES_MESSAGES.GET_CART_LIST_SUCCEED,
      data: {
        cart_length: result.length,
        cart_list: result
      }
    };
  }

  async updatePurchase({ payload, purchase_id }: { payload: UpdatePurchaseRequestBody; purchase_id: string }) {
    const { buy_count } = payload;
    const purchase = await databaseService.purchases.findOneAndUpdate(
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
      },
      {
        returnDocument: 'after'
      }
    );
    return {
      message: PURCHASES_MESSAGES.UPDATE_PURCHASE_SUCCEED,
      data: {
        purchase: purchase.value
      }
    };
  }

  async deletePurchase(purchase_ids: ObjectId[]) {
    const dataDelete = purchase_ids.map((id) => new ObjectId(id));
    await databaseService.purchases.deleteMany({
      _id: {
        $in: dataDelete
      }
    });
    return {
      message: `Delete ${purchase_ids.length} purchase succeed`
    };
  }

  async deleteAllPurchase(user_id: string) {
    await databaseService.purchases.deleteMany({
      user_id: new ObjectId(user_id),
      status: PurchaseStatus.InCart
    });
    return {
      message: PURCHASES_MESSAGES.DELETE_ALL_PURCHASE_SUCCEED
    };
  }

  async checkout({
    purchase_ids,
    user_id,
    address
  }: {
    purchase_ids: ObjectId[];
    user_id: string;
    address: OrderAddress;
  }) {
    const dataPurchases = purchase_ids.map((id) => new ObjectId(id));
    await Promise.all([
      databaseService.orders.insertOne(
        new Order({
          purchases: dataPurchases,
          user_id: new ObjectId(user_id),
          address
        })
      ),
      databaseService.purchases.updateMany(
        {
          _id: {
            $in: dataPurchases
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
      message: PURCHASES_MESSAGES.CHECKOUT_SUCCEED
    };
  }
}

const purchaseService = new PurchaseService();
export default purchaseService;
