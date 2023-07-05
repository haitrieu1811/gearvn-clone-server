import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { GetAllRequestQuery as GetAllOrders } from '~/models/requests/Order.requests';
import orderService from '~/services/orders.services';

export const getAllController = async (req: Request<ParamsDictionary, any, any, GetAllOrders>, res: Response) => {
  const { query } = req;
  const result = await orderService.getAll(query);
  return res.json(result);
};
