import { NextFunction, Request, Response } from 'express';
import pick from 'lodash/pick';
import capitalize from 'lodash/capitalize';
import { JsonWebTokenError } from 'jsonwebtoken';

import { ENV_CONFIG } from '~/constants/config';
import HTTP_STATUS from '~/constants/httpStatus';
import { COMMON_MESSAGES, USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';
import { checkSchema } from 'express-validator';

type FilterKeys<T> = Array<keyof T>;

export const filterReqBodyMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys);
    next();
  };

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    });
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: ENV_CONFIG.JWT_SECRET_ACCESS_TOKEN
    });
    if (req) {
      (req as Request).decoded_authorization = decoded_authorization;
      return true;
    }
    return decoded_authorization;
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    });
  }
};

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        custom: {
          options: (value: number) => {
            if (isNaN(Number(value))) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.PAGE_MUST_BE_A_NUMBER,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value < 1) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.PAGE_MUST_BE_A_POSITIVE_NUMBER,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            return true;
          }
        }
      },
      limit: {
        optional: true,
        custom: {
          options: (value: number) => {
            if (isNaN(Number(value))) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.LIMIT_MUST_BE_A_NUMBER,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value < 1) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.LIMIT_MUST_BE_A_POSITIVE_NUMBER,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value > 100) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.LIMIT_MUST_BE_LESS_THAN_100,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            return true;
          }
        }
      }
    },
    ['query']
  )
);
