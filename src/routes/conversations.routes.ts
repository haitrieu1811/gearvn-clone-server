import { Router } from 'express';

import { getConversationsController, getReceiversController } from '~/controllers/conversations.controllers';
import { receiverIdValidator } from '~/middlewares/conversations.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const conversationsRouter = Router();

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
