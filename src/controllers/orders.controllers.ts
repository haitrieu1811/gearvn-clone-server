import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  DeleteOrderRequestParams,
  GetOrdersRequestQuery,
  UpdateStatusRequestBody,
  UpdateStatusRequestParams
} from '~/models/requests/Order.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import orderService from '~/services/orders.services';

export const getAllController = async (
  req: Request<ParamsDictionary, any, any, GetOrdersRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await orderService.getAll(query);
  return res.json(result);
};

export const getListController = async (
  req: Request<ParamsDictionary, any, any, GetOrdersRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await orderService.getList({ query, user_id });
  return res.json(result);
};

export const updateStatusController = async (
  req: Request<UpdateStatusRequestParams, any, UpdateStatusRequestBody>,
  res: Response
) => {
  const { order_id } = req.params;
  const { status } = req.body;
  const result = await orderService.updateStatus({ status, order_id });
  return res.json(result);
};

export const deleteOrderController = async (req: Request<DeleteOrderRequestParams>, res: Response) => {
  const { order_id } = req.params;
  const result = await orderService.deleteOrder(order_id);
  return res.json(result);
};
