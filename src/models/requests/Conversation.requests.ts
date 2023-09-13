import { ParamsDictionary } from 'express-serve-static-core';

// Kiểm tra ID người nhận tin nhắn
export interface ReceiverIdRequestParams extends ParamsDictionary {
  receiver_id: string;
}

// Kiểm tra ID người gửi tin nhắn
export interface SenderIdRequestParams extends ParamsDictionary {
  sender_id: string;
}
