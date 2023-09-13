import { ParamsDictionary } from 'express-serve-static-core';

export interface NotificationIdRequestParams extends ParamsDictionary {
  notification_id: string;
}
