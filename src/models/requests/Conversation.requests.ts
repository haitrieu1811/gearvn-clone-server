import { ParamsDictionary } from 'express-serve-static-core';

// ID cuộc trò chuyện
export interface ConversationIdRequestParams extends ParamsDictionary {
  conversation_id: string;
}

// ID người nhận tin nhắn
export interface ReceiverIdRequestParams extends ParamsDictionary {
  receiver_id: string;
}

// ID người gửi tin nhắn
export interface SenderIdRequestParams extends ParamsDictionary {
  sender_id: string;
}

// Body: Tạo mới một cuộc trò chuyện
export interface CreateConversationRequestBody {
  receiver_id: string;
}
