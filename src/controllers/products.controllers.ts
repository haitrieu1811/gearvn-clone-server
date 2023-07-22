import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  AddImageRequestBody,
  AddImageRequestParams,
  CreateBrandRequestBody,
  CreateProductRequestBody,
  DeleteBrandRequestBody,
  DeleteImageRequestParams,
  DeleteProductRequestBody,
  GetBrandRequestParams,
  GetBrandsRequestQuery,
  GetProductDetailRequestParams,
  GetProductListRequestQuery,
  UpdateBrandRequestBody,
  UpdateBrandRequestParams,
  UpdateProductRequestBody,
  UpdateProductRequestParams
} from '~/models/requests/Product.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import productService from '~/services/products.services';

// Lấy danh sách nhãn hiệu
export const getBrandsController = async (
  req: Request<ParamsDictionary, any, any, GetBrandsRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await productService.getBrands(query);
  return res.json(result);
};

// Lấy thông tin chi tiết nhãn hiệu
export const getBrandController = async (req: Request<GetBrandRequestParams>, res: Response) => {
  const { brand_id } = req.params;
  const result = await productService.getBrand(brand_id);
  return res.json(result);
};

// Tạo mới nhãn hiệu
export const createBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandRequestBody>,
  res: Response
) => {
  const { name } = req.body;
  const result = await productService.createBrand(name);
  return res.json(result);
};

// Cập nhật nhãn hiệu
export const updateBrandController = async (
  req: Request<UpdateBrandRequestParams, any, UpdateBrandRequestBody>,
  res: Response
) => {
  const { brand_id } = req.params;
  const { name } = req.body;
  const result = await productService.updateBrand({ name, brand_id });
  return res.json(result);
};

// Xóa nhãn hiệu
export const deleteBrandController = async (
  req: Request<ParamsDictionary, any, DeleteBrandRequestBody>,
  res: Response
) => {
  const { brand_ids } = req.body;
  const result = await productService.deleteBrand(brand_ids);
  return res.json(result);
};

// Thêm hình ảnh sản phẩm
export const addImageController = async (
  req: Request<AddImageRequestParams, any, AddImageRequestBody>,
  res: Response
) => {
  const { images } = req.body;
  const { product_id } = req.params;
  const result = await productService.addImage({ images, product_id });
  return res.json(result);
};

// Xóa hình ảnh sản phẩm
export const deleteImageController = async (req: Request<DeleteImageRequestParams>, res: Response) => {
  const { media_id } = req.params;
  const result = await productService.deleteImage(media_id);
  return res.json(result);
};

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
  req: Request<UpdateProductRequestParams, any, UpdateProductRequestBody>,
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
export const getProductDetailController = async (req: Request<GetProductDetailRequestParams>, res: Response) => {
  const { product_id } = req.params;
  const result = await productService.getProductDetail(product_id);
  return res.json(result);
};
