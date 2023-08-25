import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { Gender, TokenType, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum';

export interface TokenPayload extends JwtPayload {
  user_id: string;
  verify: UserVerifyStatus;
  role: UserRole;
  token_type: TokenType;
  iat: number;
  exp: number;
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

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  password: string;
  confirm_password: string;
}

export interface ChangePasswordRequestBody {
  old_password: string;
  password: string;
  confirm_password: string;
}

export interface UpdateMeRequestBody {
  fullName: string;
  gender: Gender;
  phoneNumber: string;
  date_of_birth: string;
  avatar: string;
}

export interface UpdateRolesRequestBody {
  role: UserRole;
}

export interface RefreshTokenRequestBody {
  refresh_token: string;
}

export interface GetUsersRequestQuery {
  page?: string;
  limit?: string;
  gender?: Gender;
  status?: UserStatus;
  role?: UserRole;
}

export interface DeleteUserRequestBody {
  user_ids: ObjectId[];
}

export interface AddViewedProductRequestBody {
  product_id: string;
}
