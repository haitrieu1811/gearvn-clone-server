import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  AddImageRequestBody,
  AddImageRequestParams,
  CreateBrandRequestBody,
  CreateProductRequestBody,
  DeleteBrandRequestParams,
  DeleteImageRequestParams,
  DeleteProductRequestParams,
  GetProductDetailRequestParams,
  GetProductListRequestQuery,
  UpdateBrandRequestBody,
  UpdateBrandRequestParams,
  UpdateProductRequestBody,
  UpdateProductRequestParams
} from '~/models/requests/Product.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import productService from '~/services/products.services';

export const createBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandRequestBody>,
  res: Response
) => {
  const { name } = req.body;
  const result = await productService.createBrand(name);
  return res.json(result);
};

export const updateBrandController = async (
  req: Request<UpdateBrandRequestParams, any, UpdateBrandRequestBody>,
  res: Response
) => {
  const { brand_id } = req.params;
  const { name } = req.body;
  const result = await productService.updateBrand({ name, brand_id });
  return res.json(result);
};

export const deleteBrandController = async (req: Request<DeleteBrandRequestParams>, res: Response) => {
  const { brand_id } = req.params;
  const result = await productService.deleteBrand(brand_id);
  return res.json(result);
};

export const addImageController = async (
  req: Request<AddImageRequestParams, any, AddImageRequestBody>,
  res: Response
) => {
  const { images } = req.body;
  const { product_id } = req.params;
  const result = await productService.addImage({ images, product_id });
  return res.json(result);
};

export const deleteImageController = async (req: Request<DeleteImageRequestParams>, res: Response) => {
  const { media_id } = req.params;
  const result = await productService.deleteImage(media_id);
  return res.json(result);
};

export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateProductRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await productService.createProduct({ payload, user_id });
  return res.json(result);
};

export const updateProductController = async (
  req: Request<UpdateProductRequestParams, any, UpdateProductRequestBody>,
  res: Response
) => {
  const { product_id } = req.params;
  const { body: payload } = req;
  const result = await productService.updateProduct({ payload, product_id });
  return res.json(result);
};

export const deleteProductController = async (req: Request<DeleteProductRequestParams>, res: Response) => {
  const { product_id } = req.params;
  const result = await productService.deleteProduct(product_id);
  return res.json(result);
};

export const getProductListController = async (
  req: Request<ParamsDictionary, any, any, GetProductListRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await productService.getListProduct(query);
  return res.json(result);
};

export const getProductDetailController = async (req: Request<GetProductDetailRequestParams>, res: Response) => {
  const { product_id } = req.params;
  const result = await productService.getProductDetail(product_id);
  return res.json(result);
};
