import { Router } from 'express';

import {
  addReviewController,
  deleteReviewController,
  deleteReviewImageController,
  getReviewDetailController,
  getReviewsController
} from '~/controllers/reviews.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { checkProductExist } from '~/middlewares/products.middlewares';
import { addReviewValidator, checkReviewExistValidator } from '~/middlewares/reviews.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { AddReviewRequestBody } from '~/models/requests/Review.requests';
import { wrapRequestHandler } from '~/utils/handler';

const reivewsRouter = Router();

// Thêm đánh giá cho sản phẩm
reivewsRouter.post(
  '/product/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkProductExist,
  addReviewValidator,
  filterReqBodyMiddleware<AddReviewRequestBody>(['comment', 'images', 'parent_id', 'rating']),
  wrapRequestHandler(addReviewController)
);

// Lấy danh sách đánh giá theo từng sản phẩm
reivewsRouter.get('/product/:product_id', checkProductExist, wrapRequestHandler(getReviewsController));

// Lấy thông tin chi tiết của một đánh giá
reivewsRouter.get(
  '/detail/product/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getReviewDetailController)
);

// Xóa hình ảnh đính kèm của đánh giá
reivewsRouter.delete(
  '/:review_id/image/:image_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkReviewExistValidator,
  wrapRequestHandler(deleteReviewImageController)
);

// Xóa một đánh giá
reivewsRouter.delete(
  '/:review_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkReviewExistValidator,
  wrapRequestHandler(deleteReviewController)
);

export default reivewsRouter;
