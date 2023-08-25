import { ObjectId } from 'mongodb';
import { PurchaseStatus } from '~/constants/enum';

interface PurchaseInterface {
  _id?: ObjectId;
  product_id: ObjectId;
  user_id: ObjectId;
  unit_price: number;
  unit_price_after_discount: number;
  buy_count: number;
  status?: PurchaseStatus;
  created_at?: Date;
  updated_at?: Date;
}

class Purchase {
  _id?: ObjectId;
  product_id: ObjectId;
  user_id: ObjectId;
  unit_price: number;
  unit_price_after_discount: number;
  buy_count: number;
  status: PurchaseStatus;
  created_at: Date;
  updated_at: Date;

  constructor({
    _id,
    unit_price,
    unit_price_after_discount,
    buy_count,
    product_id,
    user_id,
    status,
    created_at,
    updated_at
  }: PurchaseInterface) {
    const date = new Date();
    this._id = _id;
    this.unit_price = unit_price;
    this.unit_price_after_discount = unit_price_after_discount;
    this.buy_count = buy_count;
    this.product_id = product_id;
    this.user_id = user_id;
    this.status = status || PurchaseStatus.InCart;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Purchase;
