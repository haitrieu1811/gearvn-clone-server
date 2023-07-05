import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { AddAddressRequestBody } from './User.requests';

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

export interface CheckoutRequestBody extends AddAddressRequestBody {
  purchase_ids: ObjectId[];
}
