import { ParamsDictionary } from 'express-serve-static-core';
import { NotificationType } from '~/constants/enum';

// Thêm một thông báo mới cho những admin
export interface AddNotificationRequestBody {
  type: NotificationType;
  title: string;
  content: string;
  path?: string;
}

export interface NotificationIdRequestParams extends ParamsDictionary {
  notification_id: string;
}
