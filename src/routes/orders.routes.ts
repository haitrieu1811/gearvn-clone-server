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

// Lấy danh sách tất cả đơn hàng
ordersRouter.get('/all', accessTokenValidator, adminRoleValidator, wrapRequestHandler(getAllController));

// Lấy danh sách đơn hàng
ordersRouter.get('/', accessTokenValidator, wrapRequestHandler(getListController));

// Lấy số lượng đơn hàng
ordersRouter.get('/quantity', accessTokenValidator, wrapRequestHandler(getQuantityController));

// Lấy thông tin chi tiết một đơn hàng
ordersRouter.get('/:order_id', accessTokenValidator, orderExistValidator, wrapRequestHandler(getOrderDetailController));

// Cập nhật trạng thái đơn hàng
ordersRouter.put(
  '/update-status/:order_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  orderExistValidator,
  updateStatusValidator,
  wrapRequestHandler(updateStatusController)
);

// Xóa một đơn hàng
ordersRouter.delete(
  '/:order_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  orderExistValidator,
  wrapRequestHandler(deleteOrderController)
);

export default ordersRouter;
