import { Router } from 'express';

import {
  addImageController,
  addReviewController,
  createProductController,
  deleteProductController,
  deleteReviewController,
  deleteReviewImageController,
  getProductDetailController,
  getProductListController,
  getReviewDetailController,
  getReviewsController,
  updateProductController
} from '~/controllers/products.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  addImageValidator,
  addReviewValidator,
  checkProductExist,
  checkReviewExistValidator,
  createProductValidator,
  deleteProductValidator,
  updateProductValidator
} from '~/middlewares/products.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { CreateProductRequestBody, UpdateProductRequestBody } from '~/models/requests/Product.requests';
import { AddReviewRequestBody } from '~/models/requests/ProductReview.requests';
import { wrapRequestHandler } from '~/utils/handler';

const productsRouter = Router();

// Thêm hình ảnh sản phẩm
productsRouter.post(
  '/image/:product_id',
  accessTokenValidator,
  adminRoleValidator,
  checkProductExist,
  addImageValidator,
  wrapRequestHandler(addImageController)
);

// Thêm mới sản phẩm
productsRouter.post(
  '/',
  accessTokenValidator,
  adminRoleValidator,
  createProductValidator,
  filterReqBodyMiddleware<CreateProductRequestBody>([
    'brand_id',
    'category_id',
    'description',
    'general_info',
    'name_en',
    'name_vi',
    'price',
    'price_after_discount',
    'specifications',
    'thumbnail'
  ]),
  wrapRequestHandler(createProductController)
);

// Cập nhật thông tin sản phẩm
productsRouter.patch(
  '/:product_id',
  accessTokenValidator,
  adminRoleValidator,
  checkProductExist,
  updateProductValidator,
  filterReqBodyMiddleware<UpdateProductRequestBody>([
    'brand_id',
    'category_id',
    'description',
    'general_info',
    'images',
    'name_en',
    'name_vi',
    'price',
    'price_after_discount',
    'specifications',
    'thumbnail',
    'available_count'
  ]),
  wrapRequestHandler(updateProductController)
);

// Xóa sản phẩm
productsRouter.delete(
  '/',
  accessTokenValidator,
  adminRoleValidator,
  deleteProductValidator,
  wrapRequestHandler(deleteProductController)
);

// Lấy danh sách sản phẩm
productsRouter.get('/', wrapRequestHandler(getProductListController));

// Lấy thông tin chi tiết một sản phẩm
productsRouter.get('/:product_id', checkProductExist, wrapRequestHandler(getProductDetailController));

// Thêm đánh giá sản phẩm
productsRouter.post(
  '/:product_id/reviews',
  accessTokenValidator,
  verifiedUserValidator,
  checkProductExist,
  addReviewValidator,
  filterReqBodyMiddleware<AddReviewRequestBody>(['comment', 'images', 'parent_id', 'rating']),
  wrapRequestHandler(addReviewController)
);

// Lấy danh sách đánh giá theo từng sản phẩm
productsRouter.get('/:product_id/reviews', checkProductExist, wrapRequestHandler(getReviewsController));

// Lấy thông tin chi tiết của một đánh giá
productsRouter.get(
  '/:product_id/reviews/detail',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getReviewDetailController)
);

// Xóa hình ảnh đính kèm của đánh giá
productsRouter.delete(
  '/reviews/:review_id/images/:image_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkReviewExistValidator,
  wrapRequestHandler(deleteReviewImageController)
);

// Xóa một đánh giá
productsRouter.delete(
  '/reviews/:review_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkReviewExistValidator,
  wrapRequestHandler(deleteReviewController)
);

export default productsRouter;
