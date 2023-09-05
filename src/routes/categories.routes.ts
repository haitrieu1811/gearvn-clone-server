import { Router } from 'express';
import {
  createController,
  deleteController,
  getListController,
  getOneController,
  updateController
} from '~/controllers/categories.controllers';
import {
  categoryExistValidator,
  createValidator,
  deleteValidator,
  updateValidator
} from '~/middlewares/categories.middlewares';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { CreateCategoryRequestBody, UpdateCategoryRequestBody } from '~/models/requests/Category.requests';
import { wrapRequestHandler } from '~/utils/handler';

const categoriesRouter = Router();

// Lấy danh sách danh mục
categoriesRouter.get('/', wrapRequestHandler(getListController));

// Lấy thông tin 1 danh mục
categoriesRouter.get('/:category_id', categoryExistValidator, wrapRequestHandler(getOneController));

// Tạo mới danh mục
categoriesRouter.post(
  '/',
  accessTokenValidator,
  createValidator,
  filterReqBodyMiddleware<CreateCategoryRequestBody>(['name_vi', 'name_en']),
  wrapRequestHandler(createController)
);

// Cập nhật danh mục
categoriesRouter.patch(
  '/:category_id',
  accessTokenValidator,
  updateValidator,
  categoryExistValidator,
  filterReqBodyMiddleware<UpdateCategoryRequestBody>(['name_vi', 'name_en']),
  wrapRequestHandler(updateController)
);

// Xóa danh mục
categoriesRouter.delete('/', accessTokenValidator, deleteValidator, wrapRequestHandler(deleteController));

export default categoriesRouter;
