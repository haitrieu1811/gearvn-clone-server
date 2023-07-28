import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  DeleteOrderRequestParams,
  GetOrderDetailParams,
  GetOrdersRequestQuery,
  UpdateStatusRequestBody,
  UpdateStatusRequestParams
} from '~/models/requests/Order.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import orderService from '~/services/orders.services';

// Lấy danh sách tất cả đơn hàng
export const getAllController = async (
  req: Request<ParamsDictionary, any, any, GetOrdersRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await orderService.getAll(query);
  return res.json(result);
};

// Lấy danh sách đơn hàng theo từng user đăng nhập
export const getListController = async (
  req: Request<ParamsDictionary, any, any, GetOrdersRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await orderService.getList({ query, user_id });
  return res.json(result);
};

// Lấy thông tin chi tiết đơn hàng
export const getOrderDetailController = async (req: Request<GetOrderDetailParams>, res: Response) => {
  const { order_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await orderService.getDetail({ order_id, user_id });
  return res.json(result);
};

// Lấy số lượng đơn hàng
export const getQuantityController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await orderService.GetQuantity(user_id);
  return res.json(result);
};

// Cập nhật trạng thái đơn hàng
export const updateStatusController = async (
  req: Request<UpdateStatusRequestParams, any, UpdateStatusRequestBody>,
  res: Response
) => {
  const { order_id } = req.params;
  const { status } = req.body;
  const result = await orderService.updateStatus({ status, order_id });
  return res.json(result);
};

// Xóa đơn hàng
export const deleteOrderController = async (req: Request<DeleteOrderRequestParams>, res: Response) => {
  const { order_id } = req.params;
  const result = await orderService.deleteOrder(order_id);
  return res.json(result);
};
