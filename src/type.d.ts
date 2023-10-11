import 'express';

import { TokenPayload } from './models/requests/User.requests';
import Conversation from './models/schemas/Conversation.schema';
import User from './models/schemas/User.schema';

declare module 'express' {
  interface Request {
    decoded_authorization?: TokenPayload;
    decoded_refresh_token?: TokenPayload;
    decoded_email_verify_token?: TokenPayload;
    decoded_forgot_password_token?: TokenPayload;
    user?: User;
    conversation?: Conversation;
  }
}
