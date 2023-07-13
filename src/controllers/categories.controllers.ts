import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  CreateCategoryRequestBody,
  DeleteCategoriesRequestBody,
  GetCategoriesRequestQuery,
  GetCategoryRequestParams,
  UpdateCategoryRequestBody,
  UpdateCategoryRequestParams
} from '~/models/requests/Category.requests';
import categoryService from '~/services/categories.services';

export const getListController = async (
  req: Request<ParamsDictionary, any, any, GetCategoriesRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await categoryService.getList(query);
  return res.json(result);
};

export const getOneController = async (req: Request<GetCategoryRequestParams, any, any>, res: Response) => {
  const { category_id } = req.params;
  const result = await categoryService.getOne(category_id);
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

export const deleteController = async (
  req: Request<ParamsDictionary, any, DeleteCategoriesRequestBody>,
  res: Response
) => {
  const { category_ids } = req.body;
  const result = await categoryService.delete(category_ids);
  return res.json(result);
};
