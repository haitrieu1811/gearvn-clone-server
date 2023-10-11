import { Router } from 'express';

import {
  createConversationController,
  getConversationsController,
  getMessagesController
} from '~/controllers/conversations.controllers';
import { paginationValidator } from '~/middlewares/common.middlewares';
import {
  conversationAccessValidator,
  conversationExistValidator,
  conversationIdValidator,
  createConversationValidator
} from '~/middlewares/conversations.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const conversationsRouter = Router();

// Tạo một cuộc trò chuyện mới
conversationsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createConversationValidator,
  conversationExistValidator,
  wrapRequestHandler(createConversationController)
);

// Lấy danh sách cuộc trò chuyện
conversationsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(getConversationsController)
);

// Lấy danh sách tin nhắn
conversationsRouter.get(
  '/:conversation_id/messages',
  accessTokenValidator,
  verifiedUserValidator,
  conversationIdValidator,
  conversationAccessValidator,
  paginationValidator,
  wrapRequestHandler(getMessagesController)
);

export default conversationsRouter;
