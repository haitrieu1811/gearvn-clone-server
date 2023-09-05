import { Router } from 'express';

import {
  addImageController,
  createProductController,
  deleteProductController,
  getProductDetailController,
  getProductListController,
  updateProductController
} from '~/controllers/products.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  addImageValidator,
  checkProductExist,
  createProductValidator,
  deleteProductValidator,
  updateProductValidator
} from '~/middlewares/products.middlewares';
import { accessTokenValidator, adminRoleValidator } from '~/middlewares/users.middlewares';
import { CreateProductRequestBody, UpdateProductRequestBody } from '~/models/requests/Product.requests';
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

export default productsRouter;
