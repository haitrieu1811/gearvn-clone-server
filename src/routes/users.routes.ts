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
  verifyEmailController
} from '~/controllers/users.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  RegisterValidator,
  accessTokenValidator,
  addressValidator,
  changePasswordValidator,
  deleteAddressValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { UpdateAddressRequestBody, UpdateMeRequestBody } from '~/models/requests/User.requests';
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
  wrapRequestHandler(resetPasswordController)
);
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
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
  wrapRequestHandler(addAddressController)
);
usersRouter.patch(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressValidator,
  filterReqBodyMiddleware<UpdateAddressRequestBody>(['province', 'district', 'ward', 'street', 'type']),
  wrapRequestHandler(updateAddressController)
);
usersRouter.delete(
  '/address/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  deleteAddressValidator,
  wrapRequestHandler(deleteAddressController)
);

export default usersRouter;
