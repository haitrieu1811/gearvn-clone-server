import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';

import { NotificationIdRequestParams } from '~/models/requests/Notification.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import notificationsService from '~/services/notifications.services';

// Lấy danh sách thông báo
export const getNotificationsController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { page, limit } = req.query;
  const result = await notificationsService.getNotifications({ user_id, page, limit });
  return res.json(result);
};

// Xóa thông báo (nếu không có notification_id thì xóa tất cả)
export const deleteNotificationsController = async (req: Request<NotificationIdRequestParams>, res: Response) => {
  const { notification_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await notificationsService.deleteNotifications({ notification_id, user_id });
  return res.json(result);
};

// Đánh đấu thông báo là đã đọc (nếu không có notification_id thì đánh dấu đã đọc tất cả)
export const readNotificationsController = async (req: Request<NotificationIdRequestParams>, res: Response) => {
  const { notification_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await notificationsService.readNotifications({ user_id, notification_id });
  return res.json(result);
};
