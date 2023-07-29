import { Router } from 'express';

import {
  addAddressController,
  changePasswordController,
  deleteAddressController,
  forgotPasswordController,
  getMeController,
  getUsersController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateAddressController,
  updateMeController,
  updateRolesController,
  verifyEmailController,
  deleteUserController,
  setDefaultAddressController,
  getAddressController,
  addViewedProductController,
  getViewedProductsController
} from '~/controllers/users.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  RegisterValidator,
  accessTokenValidator,
  addressExistValidator,
  addAddressValidator,
  adminRoleValidator,
  changePasswordValidator,
  deleteUserValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  limitAddressValidator,
  loginValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  roleValidator,
  updateMeValidator,
  verifiedUserValidator,
  updateAddressValidator,
  addViewedProductValidator
} from '~/middlewares/users.middlewares';
import {
  AddAddressRequestBody,
  ChangePasswordRequestBody,
  ResetPasswordRequestBody,
  UpdateAddressRequestBody,
  UpdateMeRequestBody,
  UpdateRolesRequestBody
} from '~/models/requests/User.requests';
import { wrapRequestHandler } from '~/utils/handler';

const usersRouter = Router();

// Đăng ký
usersRouter.post('/register', RegisterValidator, wrapRequestHandler(registerController));

// Đăng nhập
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

// Đăng xuất
usersRouter.post('/logout', refreshTokenValidator, wrapRequestHandler(logoutController));

// Refresh token
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController));

// Xác thực email
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));

// Gửi lại email xác thực
usersRouter.post('/resend-email-verify', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController));

// Quên mật khẩu
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));

// Đặt lại mật khẩu
usersRouter.put(
  '/reset-password',
  forgotPasswordTokenValidator,
  resetPasswordValidator,
  filterReqBodyMiddleware<ResetPasswordRequestBody>(['password']),
  wrapRequestHandler(resetPasswordController)
);

// Đổi mật khẩu
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  filterReqBodyMiddleware<ChangePasswordRequestBody>(['password']),
  wrapRequestHandler(changePasswordController)
);

// Lấy thông tin tài khoản đăng nhập
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));

// Cập nhật thông tin tài khoản đăng nhập
usersRouter.patch(
  '/me',
  accessTokenValidator,
  updateMeValidator,
  filterReqBodyMiddleware<UpdateMeRequestBody>(['avatar', 'date_of_birth', 'fullName', 'gender', 'phoneNumber']),
  wrapRequestHandler(updateMeController)
);

// Tạo mới một địa chỉ cho tài khoản
usersRouter.post(
  '/address',
  accessTokenValidator,
  verifiedUserValidator,
  limitAddressValidator,
  addAddressValidator,
  filterReqBodyMiddleware<AddAddressRequestBody>(['province', 'district', 'ward', 'street', 'type', 'isDefault']),
  wrapRequestHandler(addAddressController)
);

// Lấy thông tin chi tiết một địa chỉ của tài khoản
usersRouter.get(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  wrapRequestHandler(getAddressController)
);

// Cập nhật thông tin một địa chỉ của tài khoản
usersRouter.put(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  updateAddressValidator,
  filterReqBodyMiddleware<UpdateAddressRequestBody>(['province', 'district', 'ward', 'street', 'type', 'isDefault']),
  wrapRequestHandler(updateAddressController)
);

// Xóa một địa chỉ của tài khoản
usersRouter.delete(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  wrapRequestHandler(deleteAddressController)
);

// Đặt một địa chỉ thành địa chỉ mặc định
usersRouter.put(
  '/address/set-default/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  wrapRequestHandler(setDefaultAddressController)
);

// Cập nhật quyền cho tài khoản
usersRouter.put(
  '/role',
  accessTokenValidator,
  roleValidator,
  filterReqBodyMiddleware<UpdateRolesRequestBody>(['role']),
  wrapRequestHandler(updateRolesController)
);

// Lấy danh sách tài khoản người dùng
usersRouter.get('/list', accessTokenValidator, adminRoleValidator, wrapRequestHandler(getUsersController));

// Xóa tài khoản người dùng
usersRouter.delete('/', accessTokenValidator, deleteUserValidator, wrapRequestHandler(deleteUserController));

// Thêm một lịch sử xem sản phẩm
usersRouter.post(
  '/viewed-product',
  accessTokenValidator,
  verifiedUserValidator,
  addViewedProductValidator,
  wrapRequestHandler(addViewedProductController)
);

// Lấy danh sách lịch sử sản phẩm đã xem của tài khoản đăng nhập
usersRouter.get(
  '/viewed-product',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getViewedProductsController)
);

export default usersRouter;
