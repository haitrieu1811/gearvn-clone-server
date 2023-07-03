import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import categoryService from '~/services/categories.services';
import {
  CreateCategoryRequestBody,
  DeleteCategoryRequestParams,
  UpdateCategoryRequestBody,
  UpdateCategoryRequestParams
} from '~/models/requests/Category.requests';
import databaseService from '~/services/database.services';

export const getListController = async (req: Request, res: Response) => {
  const result = await categoryService.getList();
  return res.json(result);
};

export const createController = async (
  req: Request<ParamsDictionary, any, CreateCategoryRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const result = await categoryService.create(payload);
  return res.json(result);
};

export const updateController = async (
  req: Request<UpdateCategoryRequestParams, any, UpdateCategoryRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { category_id } = req.params;
  const result = await categoryService.update({ payload, category_id });
  return res.json(result);
};

export const deleteController = async (req: Request<DeleteCategoryRequestParams>, res: Response) => {
  const { category_id } = req.params;
  const result = await categoryService.delete(category_id);
  return res.json(result);
};
