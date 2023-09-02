import { Router } from 'express';

import {
  addImageController,
  addReviewController,
  createBrandController,
  createProductController,
  deleteBrandController,
  deleteImageController,
  deleteProductController,
  getBrandController,
  getBrandsController,
  getProductDetailController,
  getProductListController,
  getReviewDetailController,
  getReviewsController,
  updateBrandController,
  updateProductController
} from '~/controllers/products.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  addImageValidator,
  addReviewValidator,
  checkBrandExistValidator,
  checkMediaExistValidator,
  checkProductExist,
  checkReviewExistValidator,
  createBrandValidator,
  createProductValidator,
  deleteBrandValidator,
  deleteProductValidator,
  updateBrandValidator,
  updateProductValidator
} from '~/middlewares/products.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { CreateProductRequestBody, UpdateProductRequestBody } from '~/models/requests/Product.requests';
import { wrapRequestHandler } from '~/utils/handler';

const productsRouter = Router();

// Lấy danh sách các nhãn hiệu
productsRouter.get('/brand', wrapRequestHandler(getBrandsController));

// Lấy thông tin chi tiết của một nhãn hiệu
productsRouter.get('/brand/:brand_id', checkBrandExistValidator, wrapRequestHandler(getBrandController));

// Tạo mới nhãn hiệu
productsRouter.post(
  '/brand',
  accessTokenValidator,
  adminRoleValidator,
  createBrandValidator,
  wrapRequestHandler(createBrandController)
);

// Cập nhật nhãn hiệu
productsRouter.put(
  '/brand/:brand_id',
  accessTokenValidator,
  adminRoleValidator,
  checkBrandExistValidator,
  updateBrandValidator,
  wrapRequestHandler(updateBrandController)
);

// Xóa nhãn hiệu
productsRouter.delete('/brand', accessTokenValidator, deleteBrandValidator, wrapRequestHandler(deleteBrandController));

// Thêm hình ảnh sản phẩm
productsRouter.post(
  '/image/:product_id',
  accessTokenValidator,
  adminRoleValidator,
  checkProductExist,
  addImageValidator,
  wrapRequestHandler(addImageController)
);

// Xóa hình ảnh sản phẩm
productsRouter.delete(
  '/image/:media_id',
  accessTokenValidator,
  adminRoleValidator,
  checkMediaExistValidator,
  wrapRequestHandler(deleteImageController)
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

export default productsRouter;
