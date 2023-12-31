import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  AddToCartRequestBody,
  CheckoutRequestBody,
  DeletePurchaseRequestBody,
  UpdatePurchaseRequestBody,
  PurchaseIdRequestParams
} from '~/models/requests/Purchase.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import purchaseService from '~/services/purchases.services';

export const addToCartController = async (req: Request<ParamsDictionary, any, AddToCartRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body: payload } = req;
  const result = await purchaseService.addToCart({ payload, user_id });
  return res.json(result);
};

export const getCartListController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await purchaseService.getCartList(user_id);
  return res.json(result);
};

export const updatePurchaseController = async (
  req: Request<PurchaseIdRequestParams, any, UpdatePurchaseRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { purchase_id } = req.params;
  const result = await purchaseService.updatePurchase({ payload, purchase_id });
  return res.json(result);
};

export const deletePurchaseController = async (
  req: Request<ParamsDictionary, any, DeletePurchaseRequestBody>,
  res: Response
) => {
  const { purchase_ids } = req.body;
  const result = await purchaseService.deletePurchase(purchase_ids);
  return res.json(result);
};

export const deleteAllPurchaseController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await purchaseService.deleteAllPurchase(user_id);
  return res.json(result);
};

export const checkoutController = async (req: Request<ParamsDictionary, any, CheckoutRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await purchaseService.checkout(req.body, user_id);
  return res.json(result);
};
