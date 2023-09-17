import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { Gender, TokenType, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum';
import { PaginationRequestQuery } from './Common.requests';

// Token payload
export interface TokenPayload extends JwtPayload {
  user_id: string;
  verify: UserVerifyStatus;
  role: UserRole;
  token_type: TokenType;
  iat: number;
  exp: number;
}

// Body: Đăng ký
export interface RegisterRequestBody {
  email: string;
  password: string;
  confirm_password: string;
}

// Body: Đăng nhập
export interface LoginRequestBody {
  email: string;
  password: string;
}

// Body: Đăng xuất
export interface LogoutRequestBody {
  refresh_token: string;
}

// Body: Xác thực email
export interface VerifyEmailRequestBody {
  email_verify_token: string;
}

// Body: Quên mật khẩu
export interface ForgotPasswordRequestBody {
  email: string;
}

// Body: Đặt lại mật khẩu
export interface ResetPasswordRequestBody {
  password: string;
  confirm_password: string;
}

// Body: Đổi mật khẩu
export interface ChangePasswordRequestBody {
  old_password: string;
  password: string;
  confirm_password: string;
}

// Body: Cập nhật thông tin cá nhân
export interface UpdateMeRequestBody {
  fullname: string;
  gender: Gender;
  phone_number: string;
  date_of_birth: string;
  avatar: string;
}

// Body: Cập nhật quyền cho tài khoản
export interface UpdateRolesRequestBody {
  role: UserRole;
}

// Body: Refresh token
export interface RefreshTokenRequestBody {
  refresh_token: string;
}

// Query: Lấy danh sách tài khoản người dùng
export interface GetUsersRequestQuery extends PaginationRequestQuery {
  gender?: Gender;
  status?: UserStatus;
  role?: UserRole;
}

// Body: Xóa tài khoản
export interface DeleteUserRequestBody {
  user_ids: ObjectId[];
}

// Body: Thêm một sản phẩm đã xem vào lịch sử xem sản phẩm
export interface AddViewedProductRequestBody {
  product_id: string;
}
