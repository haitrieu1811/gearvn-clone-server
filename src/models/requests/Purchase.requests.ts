import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { Gender, OrderStatus, PaymentMethod, ReceiveMethod } from '~/constants/enum';

// Body: Thêm sản phẩm vào giỏ hàng
export interface AddToCartRequestBody {
  product_id: string;
  buy_count: number;
}

// Body: Cập nhật số lượng sản phẩm trong giỏ hàng
export interface UpdatePurchaseRequestBody {
  buy_count: number;
}

// Params: Purchase id
export interface PurchaseIdRequestParams extends ParamsDictionary {
  purchase_id: string;
}

// Body: Xóa sản phẩm khỏi giỏ hàng
export interface DeletePurchaseRequestBody {
  purchase_ids: ObjectId[];
}

// Body: Thanh toán giỏ hàng
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
  total_amount_before_discount: number;
  total_amount: number;
  total_amount_reduced?: number;
  total_items: number;
  receive_method: ReceiveMethod;
  payment_method: PaymentMethod;
  status?: OrderStatus;
}
