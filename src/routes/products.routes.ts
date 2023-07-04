import { Router } from 'express';

import {
  addImageController,
  createBrandController,
  createProductController,
  deleteBrandController,
  deleteImageController,
  deleteProductController,
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
  updateBrandValidator,
  updateProductValidator
} from '~/middlewares/products.middlewares';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { CreateProductRequestBody, UpdateProductRequestBody } from '~/models/requests/Product.requests';
import { wrapRequestHandler } from '~/utils/handler';

const productsRouter = Router();

productsRouter.post('/brand', accessTokenValidator, createBrandValidator, wrapRequestHandler(createBrandController));
productsRouter.put(
  '/brand/:brand_id',
  accessTokenValidator,
  checkBrandExistValidator,
  updateBrandValidator,
  wrapRequestHandler(updateBrandController)
);
productsRouter.delete(
  '/brand/:brand_id',
  accessTokenValidator,
  checkBrandExistValidator,
  wrapRequestHandler(deleteBrandController)
);
productsRouter.post(
  '/image/:product_id',
  accessTokenValidator,
  checkProductExist,
  addImageValidator,
  wrapRequestHandler(addImageController)
);
productsRouter.delete(
  '/image/:image_id',
  accessTokenValidator,
  checkMediaExistValidator,
  wrapRequestHandler(deleteImageController)
);
productsRouter.post(
  '/create',
  accessTokenValidator,
  createProductValidator,
  filterReqBodyMiddleware<CreateProductRequestBody>([
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
  wrapRequestHandler(createProductController)
);
productsRouter.patch(
  '/update/:product_id',
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
  '/delete/:product_id',
  accessTokenValidator,
  checkProductExist,
  wrapRequestHandler(deleteProductController)
);
productsRouter.get('/list', wrapRequestHandler(getProductListController));
productsRouter.get('/detail/:product_id', checkProductExist, wrapRequestHandler(getProductDetailController));

export default productsRouter;
