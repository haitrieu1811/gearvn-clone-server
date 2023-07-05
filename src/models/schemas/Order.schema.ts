import { ObjectId } from 'mongodb';

import { OrderStatus } from '~/constants/enum';
import { Address } from './User.schema';

export interface OrderAddress {
  province: string;
  district: string;
  ward: string;
  street: string;
}

interface OrderInterface {
  _id?: ObjectId;
  purchases: ObjectId[];
  user_id: ObjectId;
  address: OrderAddress;
  status?: OrderStatus;
  created_at?: Date;
  updated_at?: Date;
}

class Order {
  _id?: ObjectId;
  purchases: ObjectId[];
  user_id: ObjectId;
  address: OrderAddress;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;

  constructor(order: OrderInterface) {
    const date = new Date();

    this._id = order._id;
    this.purchases = order.purchases;
    this.user_id = order.user_id;
    this.address = order.address;
    this.status = order.status || OrderStatus.New;
    this.created_at = date;
    this.updated_at = date;
  }
}

export default Order;
