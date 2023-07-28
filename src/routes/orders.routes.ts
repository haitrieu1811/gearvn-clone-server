import { Router } from 'express';

import {
  deleteOrderController,
  getAllController,
  getListController,
  getOrderDetailController,
  getQuantityController,
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
ordersRouter.get('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getListController));
ordersRouter.get('/quantity', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getQuantityController));
ordersRouter.get(
  '/:order_id',
  accessTokenValidator,
  verifiedUserValidator,
  orderExistValidator,
  wrapRequestHandler(getOrderDetailController)
);
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
