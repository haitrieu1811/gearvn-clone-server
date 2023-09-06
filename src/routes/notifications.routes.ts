import { Router } from 'express';

import {
  addNotificationController,
  deleteNotificationsController,
  getNotificationsController,
  readNotificationsController
} from '~/controllers/notifications.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  addNotificationValidator,
  deleteNotificationsValidator,
  readNotificationsValidator
} from '~/middlewares/notifications.middlewares';
import { accessTokenValidator, adminRoleValidator } from '~/middlewares/users.middlewares';
import { AddNotificationRequestBody } from '~/models/requests/Notification.requests';
import { wrapRequestHandler } from '~/utils/handler';

const notificationsRouter = Router();

// Thêm một thông báo mới cho những admin
notificationsRouter.post(
  '/',
  accessTokenValidator,
  addNotificationValidator,
  filterReqBodyMiddleware<AddNotificationRequestBody>(['type', 'title', 'content', 'path']),
  wrapRequestHandler(addNotificationController)
);

// Lấy danh sách thông báo
notificationsRouter.get('/', accessTokenValidator, adminRoleValidator, wrapRequestHandler(getNotificationsController));

// Xóa thông báo (nếu không có notification_id thì xóa tất cả)
notificationsRouter.delete(
  '/:notification_id?',
  accessTokenValidator,
  adminRoleValidator,
  deleteNotificationsValidator,
  wrapRequestHandler(deleteNotificationsController)
);

// Đọc thông báo (nếu không có notification_id thì đánh dấu đã đọc tất cả)
notificationsRouter.patch(
  '/:notification_id?',
  accessTokenValidator,
  adminRoleValidator,
  readNotificationsValidator,
  wrapRequestHandler(readNotificationsController)
);

export default notificationsRouter;
