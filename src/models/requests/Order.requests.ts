import { ParamsDictionary } from 'express-serve-static-core';
import { OrderStatus } from '~/constants/enum';
import { PaginationRequestQuery } from './Common.requests';

export interface GetOrdersRequestQuery extends PaginationRequestQuery {
  status?: OrderStatus;
}

export interface GetOrderDetailParams extends ParamsDictionary {
  order_id: string;
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
