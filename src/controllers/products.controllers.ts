import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  CreateProductRequestBody,
  DeleteProductRequestBody,
  GetProductListRequestQuery,
  ProductIdRequestParams,
  UpdateProductRequestBody
} from '~/models/requests/Product.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import productService from '~/services/products.services';

// Tạo mới sản phẩm
export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateProductRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await productService.createProduct({ payload, user_id });
  return res.json(result);
};

// Cập nhật thông tin sản phẩm
export const updateProductController = async (
  req: Request<ProductIdRequestParams, any, UpdateProductRequestBody>,
  res: Response
) => {
  const { product_id } = req.params;
  const { body: payload } = req;
  const result = await productService.updateProduct({ payload, product_id });
  return res.json(result);
};

// Xóa sản phẩm
export const deleteProductController = async (
  req: Request<ParamsDictionary, any, DeleteProductRequestBody>,
  res: Response
) => {
  const { product_ids } = req.body;
  const result = await productService.deleteProduct(product_ids);
  return res.json(result);
};

// Lấy danh sách sản phẩm
export const getProductListController = async (
  req: Request<ParamsDictionary, any, any, GetProductListRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await productService.getListProduct(query);
  return res.json(result);
};

// Lấy thông tin chi tiết sản phẩm
export const getProductDetailController = async (req: Request<ProductIdRequestParams>, res: Response) => {
  const { product_id } = req.params;
  const result = await productService.getProductDetail(product_id);
  return res.json(result);
};
