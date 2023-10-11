import { NextFunction, Request, Response } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { CONVERSATIONS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import { ConversationIdRequestParams } from '~/models/requests/Conversation.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import Conversation from '~/models/schemas/Conversation.schema';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

export const receiverIdSchema: ParamSchema = {
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

// Tạo cuộc trò chuyện mới
export const createConversationValidator = validate(
  checkSchema(
    {
      receiver_id: receiverIdSchema
    },
    ['body']
  )
);

// Kiểm tra cuộc trò chuyện có tồn tại chưa
export const conversationExistValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { receiver_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const conversation = await databaseService.conversations.findOne({
    user_ids: {
      $all: [new ObjectId(user_id), new ObjectId(receiver_id)]
    }
  });
  if (conversation) {
    next(
      new ErrorWithStatus({
        message: CONVERSATIONS_MESSAGES.CONVERSATION_ALREADY_EXISTED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  next();
};

// Kiểm tra ID cuộc trò chuyện
export const conversationIdValidator = validate(
  checkSchema(
    {
      conversation_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONVERSATION_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (typeof value !== 'string') {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONVERSATION_ID_MUST_BE_A_STRING,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONVERSATION_ID_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const conversation = await databaseService.conversations.findOne({ _id: new ObjectId(value) });
            if (!conversation) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONVERSATION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              });
            }
            (req as Request).conversation = conversation;
            return true;
          }
        }
      }
    },
    ['params']
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

// Kiểm tra tài khoản đang đăng nhập có được quyền truy cập vào cuộc trò chuyện không
export const conversationAccessValidator = async (req: Request, _: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const conversation = req.conversation as Conversation;
  const isValid = conversation.user_ids.some((id) => id.toString() === user_id);
  if (!isValid) {
    next(
      new ErrorWithStatus({
        message: CONVERSATIONS_MESSAGES.CONVERSATION_ACCESS_DENIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};
