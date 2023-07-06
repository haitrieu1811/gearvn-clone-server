import { ParamsDictionary } from 'express-serve-static-core';
import { OrderStatus } from '~/constants/enum';

export interface GetOrdersRequestQuery {
  page?: string;
  limit?: string;
}

export interface UpdateStatusRequestParams extends ParamsDictionary {
  order_id: string;
}

export interface UpdateStatusRequestBody {
  status: OrderStatus;
}

export interface DeleteOrderRequestParams extends ParamsDictionary {
  order_id: string;
}
