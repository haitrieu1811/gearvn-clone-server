import { Router } from 'express';

import {
  deleteOrdersController,
  getAllOrdersController,
  getOrderController,
  getOrdersController,
  updateStatusController
} from '~/controllers/orders.controllers';
import { deleteOrdersValidator, orderExistValidator, updateStatusValidator } from '~/middlewares/orders.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const ordersRouter = Router();

// Lấy danh sách tất cả đơn hàng
ordersRouter.get('/all', accessTokenValidator, adminRoleValidator, wrapRequestHandler(getAllOrdersController));

// Lấy danh sách đơn hàng
ordersRouter.get('/', accessTokenValidator, wrapRequestHandler(getOrdersController));

// Lấy thông tin chi tiết một đơn hàng
ordersRouter.get('/:order_id', accessTokenValidator, orderExistValidator, wrapRequestHandler(getOrderController));

// Cập nhật trạng thái đơn hàng
ordersRouter.patch(
  '/:order_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  orderExistValidator,
  updateStatusValidator,
  wrapRequestHandler(updateStatusController)
);

// Xóa một đơn hàng
ordersRouter.delete(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  deleteOrdersValidator,
  wrapRequestHandler(deleteOrdersController)
);

export default ordersRouter;
