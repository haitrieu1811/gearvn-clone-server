import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AddressType, Gender, TokenType, UserVerifyStatus } from '~/constants/enum';

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

export interface AddAddressRequestBody {
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
}

export interface UpdateAddressRequestBody {
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
}

export interface UpdateAddressRequestParams {
  address_id: string;
}

export interface DeleteAddressRequestBody {
  address_id: string;
}
