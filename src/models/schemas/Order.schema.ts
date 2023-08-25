import { ObjectId } from 'mongodb';
import { Gender, OrderStatus, PaymentMethod, ReceiveMethod } from '~/constants/enum';

interface OrderConstructor {
  _id?: ObjectId;
  user_id: string;
  purchases: string[];
  customer_gender: Gender;
  customer_name: string;
  customer_phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
  transport_fee?: number;
  total_amount: number;
  total_amount_reduced?: number;
  total_items: number;
  receive_method: ReceiveMethod;
  payment_method: PaymentMethod;
  status?: OrderStatus;
  created_at?: Date;
  updated_at?: Date;
}

class Order {
  _id?: ObjectId;
  user_id: ObjectId;
  purchases: ObjectId[];
  customer_gender: Gender;
  customer_name: string;
  customer_phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note: string;
  transport_fee: number;
  total_amount: number;
  total_amount_reduced: number;
  total_items: number;
  receive_method: ReceiveMethod;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;

  constructor({
    _id,
    user_id,
    purchases,
    customer_gender,
    customer_name,
    customer_phone,
    province,
    district,
    ward,
    street,
    note,
    transport_fee,
    total_amount,
    total_amount_reduced,
    total_items,
    receive_method,
    payment_method,
    status,
    created_at,
    updated_at
  }: OrderConstructor) {
    const date = new Date();
    this._id = _id;
    this.user_id = new ObjectId(user_id);
    this.purchases = purchases.map((id) => new ObjectId(id));
    this.customer_gender = customer_gender;
    this.customer_name = customer_name;
    this.customer_phone = customer_phone;
    this.province = province;
    this.district = district;
    this.ward = ward;
    this.street = street;
    this.note = note || '';
    this.transport_fee = transport_fee || 0;
    this.total_amount = total_amount;
    this.total_amount_reduced = total_amount_reduced || 0;
    this.total_items = total_items;
    this.receive_method = receive_method;
    this.payment_method = payment_method;
    this.status = status || OrderStatus.New;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Order;
