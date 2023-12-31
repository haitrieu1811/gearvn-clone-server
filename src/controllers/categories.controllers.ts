import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  CategoryIdRequestParams,
  CreateCategoryRequestBody,
  DeleteCategoriesRequestBody
} from '~/models/requests/Category.requests';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import categoryService from '~/services/categories.services';

// Lấy danh sách danh mục
export const getCategoriesController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const result = await categoryService.getCategories(req.query);
  return res.json(result);
};

// Lấy thông tin chi tiết 1 danh mục
export const getCategoryController = async (req: Request<CategoryIdRequestParams, any, any>, res: Response) => {
  const { category_id } = req.params;
  const result = await categoryService.getCategory(category_id);
  return res.json(result);
};

// Tạo mới danh mục
export const createCategoryController = async (
  req: Request<ParamsDictionary, any, CreateCategoryRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await categoryService.createCategory({ payload, user_id });
  return res.json(result);
};

// Cập nhật danh mục
export const updateCategoryController = async (
  req: Request<CategoryIdRequestParams, any, CreateCategoryRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { category_id } = req.params;
  const result = await categoryService.updateCategory({ payload, category_id });
  return res.json(result);
};

// Xóa danh mục
export const deleteCategoryController = async (
  req: Request<ParamsDictionary, any, DeleteCategoriesRequestBody>,
  res: Response
) => {
  const { category_ids } = req.body;
  const result = await categoryService.deleteCategory(category_ids);
  return res.json(result);
};
