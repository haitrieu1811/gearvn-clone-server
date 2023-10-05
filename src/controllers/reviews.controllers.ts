import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { ImageIdRequestParams } from '~/models/requests/Media.requests';
import { ProductIdRequestParams } from '~/models/requests/Product.requests';
import { AddReviewRequestBody, ReviewIdRequestParams } from '~/models/requests/Review.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import productReviewsService from '~/services/reviews.services';

// Thêm đánh giá sản phẩm
export const addReviewController = async (
  req: Request<ProductIdRequestParams, any, AddReviewRequestBody>,
  res: Response
) => {
  const { product_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await productReviewsService.addReview({ body: req.body, product_id, user_id });
  return res.json(result);
};

// Lấy danh sách đánh giá theo từng sản phẩm
export const getReviewsController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { page, limit } = req.query;
  const result = await productReviewsService.getReviews({ page, limit });
  return res.json(result);
};

// Lấy danh sách đánh giá theo từng sản phẩm
export const getReviewsByProductIdController = async (
  req: Request<ProductIdRequestParams, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { product_id } = req.params;
  const result = await productReviewsService.getReviews({ product_id, ...req.query });
  return res.json(result);
};

// Lấy thông tin chi tiết đánh giá
export const getReviewDetailController = async (req: Request<ProductIdRequestParams>, res: Response) => {
  const { product_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await productReviewsService.getReviewDetail({ product_id, user_id });
  return res.json(result);
};

// Xóa một hình ảnh đính kèm của đánh giá
export const deleteReviewImageController = async (req: Request<ImageIdRequestParams>, res: Response) => {
  const { image_id } = req.params;
  const result = await productReviewsService.deleteReviewImage(image_id);
  return res.json(result);
};

// Xóa một đánh giá
export const deleteReviewController = async (req: Request<ReviewIdRequestParams>, res: Response) => {
  const { review_id } = req.params;
  const result = await productReviewsService.deleteReview(review_id);
  return res.json(result);
};
