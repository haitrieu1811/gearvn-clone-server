import { Router } from 'express';

import {
  addAddressController,
  changePasswordController,
  deleteAddressController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateAddressController,
  updateMeController,
  updateRolesController,
  verifyEmailController
} from '~/controllers/users.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  RegisterValidator,
  accessTokenValidator,
  addressExistValidator,
  addressValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  rolesValidator,
  updateMeValidator,
  verifiedUserValidator
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

usersRouter.post('/register', RegisterValidator, wrapRequestHandler(registerController));
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));
usersRouter.post('/resend-email-verify', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController));
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));
usersRouter.put(
  '/reset-password',
  forgotPasswordTokenValidator,
  resetPasswordValidator,
  filterReqBodyMiddleware<ResetPasswordRequestBody>(['password']),
  wrapRequestHandler(resetPasswordController)
);
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  filterReqBodyMiddleware<ChangePasswordRequestBody>(['password']),
  wrapRequestHandler(changePasswordController)
);
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));
usersRouter.patch(
  '/me',
  accessTokenValidator,
  updateMeValidator,
  filterReqBodyMiddleware<UpdateMeRequestBody>(['avatar', 'date_of_birth', 'fullName', 'gender', 'phoneNumber']),
  wrapRequestHandler(updateMeController)
);
usersRouter.post(
  '/address',
  accessTokenValidator,
  verifiedUserValidator,
  addressValidator,
  filterReqBodyMiddleware<AddAddressRequestBody>(['province', 'district', 'ward', 'street', 'type']),
  wrapRequestHandler(addAddressController)
);
usersRouter.put(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressValidator,
  addressExistValidator,
  filterReqBodyMiddleware<UpdateAddressRequestBody>(['province', 'district', 'ward', 'street', 'type']),
  wrapRequestHandler(updateAddressController)
);
usersRouter.delete(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  wrapRequestHandler(deleteAddressController)
);
usersRouter.put(
  '/roles',
  accessTokenValidator,
  rolesValidator,
  filterReqBodyMiddleware<UpdateRolesRequestBody>(['roles']),
  wrapRequestHandler(updateRolesController)
);

export default usersRouter;
