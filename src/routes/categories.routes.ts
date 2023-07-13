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

categoriesRouter.get('/list', wrapRequestHandler(getListController));
categoriesRouter.get('/:category_id', categoryExistValidator, wrapRequestHandler(getOneController));
categoriesRouter.post(
  '/create',
  accessTokenValidator,
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
categoriesRouter.delete('/', accessTokenValidator, deleteValidator, wrapRequestHandler(deleteController));

export default categoriesRouter;
