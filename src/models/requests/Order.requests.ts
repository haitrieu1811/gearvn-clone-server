import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

import { OrderStatus } from '~/constants/enum';
import { PaginationRequestQuery } from './Common.requests';

// Query: Lấy danh sách đơn hàng
export interface GetOrdersRequestQuery extends PaginationRequestQuery {
  status?: OrderStatus;
}

// Params: Lấy thông tin chi tiết đơn hàng
export interface GetOrderDetailParams extends ParamsDictionary {
  order_id: string;
}

// Params: Cập nhật trạng thái đơn hàng
export interface UpdateStatusRequestParams extends ParamsDictionary {
  order_id: string;
}

// Body: Cập nhật trạng thái đơn hàng
export interface UpdateStatusRequestBody {
  status: OrderStatus;
}

// Body: Xóa một hoặc nhiều đơn hàng
export interface DeleteOrdersRequestBody {
  order_ids: string[];
}
