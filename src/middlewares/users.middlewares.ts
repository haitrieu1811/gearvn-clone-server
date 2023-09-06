import { NextFunction, Request } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import capitalize from 'lodash/capitalize';
import { ObjectId } from 'mongodb';

import { ENV_CONFIG } from '~/constants/config';
import { UserRole, UserVerifyStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import databaseService from '~/services/database.services';
import userService from '~/services/users.services';
import { hashPassword } from '~/utils/crypto';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';
import { productIdSchema } from './products.middlewares';
import { verifyAccessToken } from './common.middlewares';

const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
  },
  isEmail: {
    errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
  },
  isLength: {
    options: {
      min: 5,
      max: 160
    },
    errorMessage: USERS_MESSAGES.EMAIL_LENGTH
  },
  custom: {
    options: async (value) => {
      const { isExist } = await userService.checkEmailExist(value);
      if (isExist) {
        throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXIST);
      }
      return true;
    }
  },
  trim: true
};

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 32
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_LENGTH_FROM_6_TO_32_CHARACTERS
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  },
  trim: true
};

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH_PASSWORD);
      }
      return true;
    }
  }
};

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 250
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH
  }
};

export const expireTokenSchema: ParamSchema = {
  optional: true,
  custom: {
    options: (value: number) => {
      if (!Number.isInteger(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.EXPIRE_ACCESS_TOKEN_MUST_BE_A_INTEGER,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      return true;
    }
  }
};

export const genderSchema: ParamSchema = {
  optional: true
};

export const fullNameSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.FULLNAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.FULLNAME_MUST_LENGTH_FROM_1_TO_100_CHARACTERS
  },
  trim: true
};

export const phoneNumberSchema: ParamSchema = {
  optional: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED);
      }
      // if (!PHONE_NUMBER_REGEX.test(value)) {
      //   throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID);
      // }
      const { user_id } = req.decoded_authorization as TokenPayload;
      const user = await databaseService.users.findOne({ phoneNumber: value });
      if (user && user._id.toString() !== user_id) {
        throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_EXIST);
      }
      return true;
    }
  }
};

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1];
            return await verifyAccessToken(access_token, req as Request);
          }
        }
      }
    },
    ['headers']
  )
);

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN }),
                databaseService.refresh_tokens.findOne({ token: value })
              ]);
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }
              (req as Request).decoded_refresh_token = decoded_refresh_token;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }
              throw error;
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const adminRoleValidator = async (req: Request, res: any, next: NextFunction) => {
  const { role } = req.decoded_authorization as TokenPayload;
  const isAdmin = role === UserRole.Admin;
  if (!isAdmin) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.PERMISSION_DENIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            try {
              const [user, decoded_forgot_password_token] = await Promise.all([
                databaseService.users.findOne({ forgot_password_token: value }),
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_SECRET_FORGOT_PASSWORD_TOKEN
                })
              ]);
              if (!user) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }
              (req as Request).decoded_forgot_password_token = decoded_forgot_password_token;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }
              throw error;
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            try {
              const [user, decoded_email_verify_token] = await Promise.all([
                databaseService.users.findOne({ email_verify_token: value }),
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_SECRET_EMAIL_VERIFY_TOKEN
                })
              ]);
              if (!user) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }
              (req as Request).decoded_email_verify_token = decoded_email_verify_token;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }
              throw error;
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const verifiedUserValidator = (req: Request, res: any, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload;
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_IS_UNVERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};

export const RegisterValidator = validate(
  checkSchema(
    {
      email: emailSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
);

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value) => {
            const { isExist } = await userService.checkEmailExist(value);
            if (!isExist) {
              throw new Error(USERS_MESSAGES.EMAIL_NOT_EXIST);
            }
            return true;
          }
        }
      },
      password: {
        ...passwordSchema,
        isLength: undefined,
        isStrongPassword: undefined,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne(
              {
                email: req.body.email,
                password: hashPassword(value)
              },
              {
                projection: {
                  password: 0,
                  email_verify_token: 0,
                  forgot_password_token: 0
                }
              }
            );
            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT);
            }
            req.user = user;
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value) => {
            const { isExist } = await userService.checkEmailExist(value);
            if (!isExist) {
              throw new Error(USERS_MESSAGES.EMAIL_NOT_EXIST);
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
);

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new Error(USERS_MESSAGES.OLD_PASSWORD_IS_REQUIRED);
            }
            const { user_id } = req.decoded_authorization as TokenPayload;
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
            if (user?.password !== hashPassword(value)) {
              throw new Error(USERS_MESSAGES.OLD_PASSWORD_INCORRECT);
            }
            return true;
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
);

export const updateMeValidator = validate(
  checkSchema(
    {
      fullName: fullNameSchema,
      gender: genderSchema,
      phoneNumber: phoneNumberSchema,
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_ISO8601_STRING
        },
        trim: true
      },
      avatar: imageSchema
    },
    ['body']
  )
);

export const roleValidator = validate(
  checkSchema(
    {
      role: {
        custom: {
          options: (value: number) => {
            if (!value) {
              throw new Error(USERS_MESSAGES.ROLE_IS_REQUIRED);
            }
            if (typeof value !== 'number') {
              throw new Error(USERS_MESSAGES.ROLE_MUST_BE_A_NUMBER);
            }
            if (!(value in UserRole)) {
              throw new Error(USERS_MESSAGES.ROLE_IS_INVALID);
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const deleteUserValidator = validate(
  checkSchema(
    {
      user_ids: {
        custom: {
          options: (value: ObjectId[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_IDS_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_IDS_MUST_BE_AN_ARRAY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value.length <= 0) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_IDS_NOT_EMPTY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const isValid = value.every((item) => ObjectId.isValid(item));
            if (!isValid) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_IDS_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const addViewedProductValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema
    },
    ['body']
  )
);
