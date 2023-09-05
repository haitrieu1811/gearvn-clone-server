import { Router } from 'express';

import {
  createBrandController,
  deleteBrandController,
  getBrandController,
  getBrandsController,
  updateBrandController
} from '~/controllers/brands.controllers';
import {
  checkBrandExistValidator,
  createBrandValidator,
  deleteBrandValidator,
  updateBrandValidator
} from '~/middlewares/brands.middlewares';
import { accessTokenValidator, adminRoleValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const brandsRouter = Router();

// Lấy danh sách các nhãn hiệu
brandsRouter.get('/', wrapRequestHandler(getBrandsController));

// Lấy thông tin chi tiết của một nhãn hiệu
brandsRouter.get('/:brand_id', checkBrandExistValidator, wrapRequestHandler(getBrandController));

// Tạo mới nhãn hiệu
brandsRouter.post(
  '/',
  accessTokenValidator,
  adminRoleValidator,
  createBrandValidator,
  wrapRequestHandler(createBrandController)
);

// Cập nhật nhãn hiệu
brandsRouter.put(
  '/:brand_id',
  accessTokenValidator,
  adminRoleValidator,
  checkBrandExistValidator,
  updateBrandValidator,
  wrapRequestHandler(updateBrandController)
);

// Xóa nhãn hiệu
brandsRouter.delete('/', accessTokenValidator, deleteBrandValidator, wrapRequestHandler(deleteBrandController));

export default brandsRouter;
