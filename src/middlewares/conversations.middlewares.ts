import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { CONVERSATIONS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

const receiverIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.RECEIVER_ID_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.RECEIVER_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (value === req.decoded_authorization.user_id) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.RECEIVER_ID_MUST_BE_DIFFERENT_FROM_SENDER_ID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const count = await databaseService.users.countDocuments({ _id: new ObjectId(value) });
      if (count === 0) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.RECEIVER_NOT_EXISTED,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      return true;
    }
  }
};

const senderIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.SENDER_ID_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.SENDER_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const count = await databaseService.users.countDocuments({ _id: new ObjectId(value) });
      if (count === 0) {
        throw new ErrorWithStatus({
          message: CONVERSATIONS_MESSAGES.SENDER_NOT_EXISTED,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      return true;
    }
  }
};

// Thêm một tin nhắn mới
export const addConversationValidator = validate(
  checkSchema(
    {
      receiver_id: receiverIdSchema,
      content: {
        custom: {
          options: (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONTENT_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value.trim().length === 0) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONTENT_CANNOT_BE_EMPTY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

// Kiểm tra ID người nhận tin nhắn
export const receiverIdValidator = validate(
  checkSchema(
    {
      receiver_id: receiverIdSchema
    },
    ['params']
  )
);

// Kiểm tra ID người gửi tin nhắn
export const senderIdValidator = validate(
  checkSchema(
    {
      sender_id: senderIdSchema
    },
    ['params']
  )
);
