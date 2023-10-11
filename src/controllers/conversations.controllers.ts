import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { ConversationIdRequestParams, CreateConversationRequestBody } from '~/models/requests/Conversation.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import conversationsService from '~/services/conversations.services';

// Tạo một cuộc trò chuyện mới
export const createConversationController = async (
  req: Request<ParamsDictionary, any, CreateConversationRequestBody>,
  res: Response
) => {
  const { receiver_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await conversationsService.createConversation([user_id, receiver_id]);
  return res.json(result);
};

// Lấy danh sách cuộc trò chuyện của một người dùng
export const getConversationsController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await conversationsService.getConversations({ user_id, query: req.query });
  return res.json(result);
};

// Lấy danh sách tin nhắn
export const getMessagesController = async (
  req: Request<ConversationIdRequestParams, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { conversation_id } = req.params;
  const result = await conversationsService.getMessages({ conversation_id, user_id, query: req.query });
  return res.json(result);
};
