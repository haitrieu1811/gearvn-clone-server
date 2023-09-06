import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import { NotificationType } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { numberEnumToArray } from '~/utils/commons';
import { validate } from '~/utils/validation';

const notificationTypes = numberEnumToArray(NotificationType);

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

// Thêm một thông báo mới tới những admin
export const addNotificationValidator = validate(
  checkSchema(
    {
      type: {
        notEmpty: {
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_TYPE_IS_REQUIRED
        },
        isIn: {
          options: [notificationTypes],
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_TYPE_IS_INVALID
        },
        toInt: true
      },
      title: {
        notEmpty: {
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_TITLE_MUST_BE_A_STRING
        },
        trim: true
      },
      content: {
        notEmpty: {
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_CONTENT_MUST_BE_A_STRING
        },
        trim: true
      },
      path: {
        optional: true,
        isString: {
          errorMessage: NOTIFICATIONS_MESSAGES.NOTIFICATION_PATH_MUST_BE_A_STRING
        },
        trim: true
      }
    },
    ['body']
  )
);

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
