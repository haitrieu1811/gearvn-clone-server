import { ObjectId } from 'mongodb';
import { PurchaseStatus } from '~/constants/enum';

interface PurchaseInterface {
  _id?: ObjectId;
  buy_count: number;
  product_id: ObjectId;
  user_id: ObjectId;
  status?: PurchaseStatus;
  created_at?: Date;
  updated_at?: Date;
}

class Purchase {
  _id?: ObjectId;
  buy_count: number;
  product_id: ObjectId;
  user_id: ObjectId;
  status: PurchaseStatus;
  created_at: Date;
  updated_at: Date;

  constructor(purchase: PurchaseInterface) {
    const date = new Date();

    this._id = purchase._id;
    this.buy_count = purchase.buy_count;
    this.product_id = purchase.product_id;
    this.user_id = purchase.user_id;
    this.status = purchase.status || PurchaseStatus.InCart;
    this.created_at = date;
    this.updated_at = date;
  }
}

export default Purchase;
