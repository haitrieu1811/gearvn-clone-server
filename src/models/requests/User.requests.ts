import { JwtPayload } from 'jsonwebtoken';
import { TokenType, UserVerifyStatus } from '~/constants/enum';

export interface TokenPayload extends JwtPayload {
  user_id: string;
  verify: UserVerifyStatus;
  token_type: TokenType;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LogoutRequestBody {
  refresh_token: string;
}

export interface VerifyEmailRequestBody {
  email_verify_token: string;
}
