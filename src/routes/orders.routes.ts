import { Router } from 'express';

import {
  deleteOrderController,
  getAllController,
  getListController,
  updateStatusController
} from '~/controllers/orders.controllers';
import { orderExistValidator, updateStatusValidator } from '~/middlewares/orders.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const ordersRouter = Router();

ordersRouter.get(
  '/all',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  wrapRequestHandler(getAllController)
);
ordersRouter.get('/list', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getListController));
ordersRouter.put(
  '/update-status/:order_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  orderExistValidator,
  updateStatusValidator,
  wrapRequestHandler(updateStatusController)
);
ordersRouter.delete(
  '/:order_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  orderExistValidator,
  wrapRequestHandler(deleteOrderController)
);

export default ordersRouter;
