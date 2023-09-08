import { ParamsDictionary } from 'express-serve-static-core';

// Thêm một tin nhắn
export interface AddConversationRequestBody {
  receiver_id: string;
  content: string;
}

// Kiểm tra ID người nhận tin nhắn
export interface ReceiverIdRequestParams extends ParamsDictionary {
  receiver_id: string;
}

// Kiểm tra ID người gửi tin nhắn
export interface SenderIdRequestParams extends ParamsDictionary {
  sender_id: string;
}
