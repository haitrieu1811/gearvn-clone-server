import { Router } from 'express';

import {
  addImageController,
  createBrandController,
  createProductController,
  deleteBrandController,
  deleteImageController,
  deleteProductController,
  getBrandController,
  getBrandsController,
  getProductDetailController,
  getProductListController,
  updateBrandController,
  updateProductController
} from '~/controllers/products.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  addImageValidator,
  checkBrandExistValidator,
  checkMediaExistValidator,
  checkProductExist,
  createBrandValidator,
  createProductValidator,
  deleteBrandValidator,
  deleteProductValidator,
  updateBrandValidator,
  updateProductValidator
} from '~/middlewares/products.middlewares';
import { accessTokenValidator, adminRoleValidator } from '~/middlewares/users.middlewares';
import { CreateProductRequestBody, UpdateProductRequestBody } from '~/models/requests/Product.requests';
import { wrapRequestHandler } from '~/utils/handler';

const productsRouter = Router();

// Brand
productsRouter.get('/brand', wrapRequestHandler(getBrandsController));
productsRouter.get('/brand/:brand_id', checkBrandExistValidator, wrapRequestHandler(getBrandController));
productsRouter.post('/brand', accessTokenValidator, createBrandValidator, wrapRequestHandler(createBrandController));
productsRouter.put(
  '/brand/:brand_id',
  accessTokenValidator,
  checkBrandExistValidator,
  updateBrandValidator,
  wrapRequestHandler(updateBrandController)
);
productsRouter.delete('/brand', accessTokenValidator, deleteBrandValidator, wrapRequestHandler(deleteBrandController));
// Image
productsRouter.post(
  '/image/:product_id',
  accessTokenValidator,
  checkProductExist,
  addImageValidator,
  wrapRequestHandler(addImageController)
);
productsRouter.delete(
  '/image/:media_id',
  accessTokenValidator,
  checkMediaExistValidator,
  wrapRequestHandler(deleteImageController)
);
// Product
productsRouter.post(
  '/',
  accessTokenValidator,
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
productsRouter.patch(
  '/:product_id',
  accessTokenValidator,
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
    'thumbnail'
  ]),
  wrapRequestHandler(updateProductController)
);
productsRouter.delete(
  '/',
  accessTokenValidator,
  adminRoleValidator,
  deleteProductValidator,
  wrapRequestHandler(deleteProductController)
);
productsRouter.get('/', wrapRequestHandler(getProductListController));
productsRouter.get('/:product_id', checkProductExist, wrapRequestHandler(getProductDetailController));

export default productsRouter;
