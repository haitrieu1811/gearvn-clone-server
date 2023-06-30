import { Router } from 'express';

import {
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyEmailController
} from '~/controllers/users.controllers';
import {
  RegisterValidator,
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  verifyEmailValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const usersRouter = Router();

usersRouter.post('/register', RegisterValidator, wrapRequestHandler(registerController));
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));
usersRouter.post('/verify-email', verifyEmailValidator, wrapRequestHandler(verifyEmailController));
usersRouter.post('/resend-email-verify', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController));

export default usersRouter;
