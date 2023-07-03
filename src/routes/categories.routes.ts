import { Router } from 'express';
import {
  createController,
  deleteController,
  getListController,
  updateController
} from '~/controllers/categories.controllers';
import { categoryExistValidator, createValidator, updateValidator } from '~/middlewares/categories.middlewares';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { CreateCategoryRequestBody, UpdateCategoryRequestBody } from '~/models/requests/Category.requests';
import { wrapRequestHandler } from '~/utils/handler';

const categoriesRouter = Router();

categoriesRouter.get('/list', wrapRequestHandler(getListController));
categoriesRouter.post(
  '/create',
  createValidator,
  filterReqBodyMiddleware<CreateCategoryRequestBody>(['name_vi', 'name_en']),
  wrapRequestHandler(createController)
);
categoriesRouter.patch(
  '/update/:category_id',
  accessTokenValidator,
  updateValidator,
  categoryExistValidator,
  filterReqBodyMiddleware<UpdateCategoryRequestBody>(['name_vi', 'name_en']),
  wrapRequestHandler(updateController)
);
categoriesRouter.delete(
  '/delete/:category_id',
  accessTokenValidator,
  categoryExistValidator,
  wrapRequestHandler(deleteController)
);

export default categoriesRouter;
