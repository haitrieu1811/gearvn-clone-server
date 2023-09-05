import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { ImageIdRequestParams } from '~/models/requests/Media.requests';

import {
  AddImageRequestBody,
  CreateProductRequestBody,
  DeleteProductRequestBody,
  GetProductListRequestQuery,
  ProductIdRequestParams,
  UpdateProductRequestBody
} from '~/models/requests/Product.requests';
import { AddReviewRequestBody, ReviewIdRequestParams } from '~/models/requests/ProductReview.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import productService from '~/services/products.services';

// Thêm hình ảnh sản phẩm
export const addImageController = async (
  req: Request<ProductIdRequestParams, any, AddImageRequestBody>,
  res: Response
) => {
  const { images } = req.body;
  const { product_id } = req.params;
  const result = await productService.addImage({ images, product_id });
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

// Thêm đánh giá sản phẩm
export const addReviewController = async (
  req: Request<ProductIdRequestParams, any, AddReviewRequestBody>,
  res: Response
) => {
  const { product_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await productService.addReview({ body: req.body, product_id, user_id });
  return res.json(result);
};

// Lấy danh sách đánh giá theo từng sản phẩm
export const getReviewsController = async (
  req: Request<ProductIdRequestParams, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { product_id } = req.params;
  const result = await productService.getReviews({ product_id, ...req.query });
  return res.json(result);
};

// Lấy thông tin chi tiết đánh giá
export const getReviewDetailController = async (req: Request<ProductIdRequestParams>, res: Response) => {
  const { product_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await productService.getReviewDetail({ product_id, user_id });
  return res.json(result);
};

// Xóa một hình ảnh đính kèm của đánh giá
export const deleteReviewImageController = async (req: Request<ImageIdRequestParams>, res: Response) => {
  const { image_id } = req.params;
  const result = await productService.deleteReviewImage(image_id);
  return res.json(result);
};

// Xóa một đánh giá
export const deleteReviewController = async (req: Request<ReviewIdRequestParams>, res: Response) => {
  const { review_id } = req.params;
  const result = await productService.deleteReview(review_id);
  return res.json(result);
};
