import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

const notificationIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_ID_IS_REQUIRED
  },
  custom: {
    options: async (value) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: NOTIFICATIONS_MESSAGES.NOTIFICATION_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const count = await databaseService.notifications.countDocuments({ _id: new ObjectId(value) });
      if (count === 0) {
        throw new ErrorWithStatus({
          message: NOTIFICATIONS_MESSAGES.NOTIFICATION_ID_IS_NOT_EXISTED,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      return true;
    }
  }
};

// Kiểm tra notification_id
export const notificationIdValidator = validate(
  checkSchema(
    {
      notification_id: notificationIdSchema
    },
    ['params']
  )
);

// Xóa thông báo
export const deleteNotificationsValidator = validate(
  checkSchema(
    {
      notification_id: {
        ...notificationIdSchema,
        notEmpty: false,
        optional: true
      }
    },
    ['params']
  )
);

// Đọc thông báo
export const readNotificationsValidator = validate(
  checkSchema(
    {
      notification_id: {
        ...notificationIdSchema,
        notEmpty: false,
        optional: true
      }
    },
    ['params']
  )
);
