import { Router } from 'express';

import {
  addReviewController,
  deleteReviewController,
  deleteReviewImageController,
  getReviewDetailController,
  getReviewsController
} from '~/controllers/productReviews.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { addReviewValidator, checkReviewExistValidator } from '~/middlewares/productReviews.middlewares';
import { checkProductExist } from '~/middlewares/products.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { AddReviewRequestBody } from '~/models/requests/ProductReview.requests';
import { wrapRequestHandler } from '~/utils/handler';

const productReviewsRouter = Router();

// Thêm đánh giá cho sản phẩm
productReviewsRouter.post(
  '/product/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkProductExist,
  addReviewValidator,
  filterReqBodyMiddleware<AddReviewRequestBody>(['comment', 'images', 'parent_id', 'rating']),
  wrapRequestHandler(addReviewController)
);

// Lấy danh sách đánh giá theo từng sản phẩm
productReviewsRouter.get('/product/:product_id', checkProductExist, wrapRequestHandler(getReviewsController));

// Lấy thông tin chi tiết của một đánh giá
productReviewsRouter.get(
  '/detail/product/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getReviewDetailController)
);

// Xóa hình ảnh đính kèm của đánh giá
productReviewsRouter.delete(
  '/:review_id/image/:image_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkReviewExistValidator,
  wrapRequestHandler(deleteReviewImageController)
);

// Xóa một đánh giá của sản phẩm
productReviewsRouter.delete(
  '/:review_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkReviewExistValidator,
  wrapRequestHandler(deleteReviewController)
);

export default productReviewsRouter;
