import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { AddConversationRequestBody, ReceiverIdRequestParams } from '~/models/requests/Conversation.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import conversationsService from '~/services/conversations.services';

// Thêm một tin nhắn mới
export const addConversationController = async (
  req: Request<ParamsDictionary, any, AddConversationRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { content, receiver_id } = req.body;
  const result = await conversationsService.addConversation({ content, receiver_id, sender_id: user_id });
  return res.json(result);
};

// Lấy danh sách tin nhắn
export const getConversationsController = async (
  req: Request<ReceiverIdRequestParams, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { user_id: sender_id } = req.decoded_authorization as TokenPayload;
  const { receiver_id } = req.params;
  const { page, limit } = req.query;
  const result = await conversationsService.getConversations({ sender_id, receiver_id, page, limit });
  return res.json(result);
};

// Lấy danh sách người dùng đã nhắn tin
export const getReceiversController = async (req: Request, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload;
  const result = await conversationsService.getReceivers({ user_id, role });
  return res.json(result);
};
