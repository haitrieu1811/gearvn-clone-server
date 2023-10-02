import { Router } from 'express';

import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController
} from '~/controllers/categories.controllers';
import {
  categoryExistValidator,
  deleteCategoryValidator,
  updateCategoryValidator
} from '~/middlewares/categories.middlewares';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { CreateCategoryRequestBody } from '~/models/requests/Category.requests';
import { wrapRequestHandler } from '~/utils/handler';

const categoriesRouter = Router();

// Lấy danh sách danh mục
categoriesRouter.get('/', wrapRequestHandler(getCategoriesController));

// Lấy thông tin 1 danh mục
categoriesRouter.get(
  '/:category_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  categoryExistValidator,
  wrapRequestHandler(getCategoryController)
);

// Tạo mới danh mục
categoriesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  createCategoryController,
  filterReqBodyMiddleware<CreateCategoryRequestBody>(['name_vi', 'name_en']),
  wrapRequestHandler(createCategoryController)
);

// Cập nhật danh mục
categoriesRouter.patch(
  '/:category_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  updateCategoryValidator,
  categoryExistValidator,
  filterReqBodyMiddleware<CreateCategoryRequestBody>(['name_vi', 'name_en']),
  wrapRequestHandler(updateCategoryController)
);

// Xóa danh mục
categoriesRouter.delete(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  deleteCategoryValidator,
  wrapRequestHandler(deleteCategoryController)
);

export default categoriesRouter;
