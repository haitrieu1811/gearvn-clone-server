import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { Gender, OrderStatus, PaymentMethod, ReceiveMethod } from '~/constants/enum';

export interface AddToCartRequestBody {
  product_id: string;
  buy_count: number;
}

export interface UpdatePurchaseRequestBody {
  buy_count: number;
}

export interface UpdatePurchaseRequestParams extends ParamsDictionary {
  purchase_id: string;
}

export interface DeletePurchaseRequestBody {
  purchase_ids: ObjectId[];
}

export interface CheckoutRequestBody {
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
}
