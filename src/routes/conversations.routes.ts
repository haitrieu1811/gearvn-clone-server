import { Router } from 'express';

import {
  addConversationController,
  getConversationsController,
  getReceiversController
} from '~/controllers/conversations.controllers';
import {
  addConversationValidator,
  receiverIdValidator,
  senderIdValidator
} from '~/middlewares/conversations.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const conversationsRouter = Router();

// Thêm một tin nhắn mới
conversationsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  addConversationValidator,
  wrapRequestHandler(addConversationController)
);

// Lấy danh sách tin nhắn
conversationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  receiverIdValidator,
  wrapRequestHandler(getConversationsController)
);

// Lấy danh sách người dùng đã nhắn tin
conversationsRouter.get(
  '/receivers',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getReceiversController)
);

export default conversationsRouter;
