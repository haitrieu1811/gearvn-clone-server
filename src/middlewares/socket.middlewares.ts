import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

import { TokenPayload } from '~/models/requests/User.requests';
import { verifyAccessToken } from './common.middlewares';
import { UserVerifyStatus } from '~/constants/enum';
import { ErrorWithStatus } from '~/models/Errors';
import { USERS_MESSAGES } from '~/constants/messages';
import HTTP_STATUS from '~/constants/httpStatus';

// Kiểm tra access token
export const accessTokenValidator = async (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
  const { Authorization } = socket.handshake.auth;
  const access_token = Authorization.split(' ')[1];
  try {
    const decoded_authorization = await verifyAccessToken(access_token);
    const { verify } = decoded_authorization as TokenPayload;
    if (verify === UserVerifyStatus.Unverified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_IS_UNVERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      });
    }
    socket.handshake.auth.decoded_authorization = decoded_authorization;
    socket.handshake.auth.access_token = access_token;
    next();
  } catch (error) {
    next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    });
  }
};
