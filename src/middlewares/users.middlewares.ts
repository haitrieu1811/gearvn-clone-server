import { config } from 'dotenv';
import { NextFunction, Request } from 'express';
import { ParamSchema, check, checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import capitalize from 'lodash/capitalize';
import { ObjectId } from 'mongodb';

import { USERS_PROJECTION } from '~/constants/db';
import { AddressType, UserRole, UserVerifyStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { PHONE_NUMBER_REGEX } from '~/constants/regex';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import databaseService from '~/services/database.services';
import userService from '~/services/users.services';
import { hashPassword } from '~/utils/crypto';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';
config();

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

export const provinceSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PROVINCE_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PROVINCE_MUST_BE_A_STRING
  }
};

export const districtSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.DISTRICT_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.DISTRICT_MUST_BE_A_STRING
  }
};

export const wardSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.WARD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.WARD_MUST_BE_A_STRING
  }
};

export const streetSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.STREET_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.STREET_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 250
    },
    errorMessage: USERS_MESSAGES.STREET_LENGTH
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
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              });
              (req as Request).decoded_authorization = decoded_authorization;
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            return true;
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
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refresh_tokens.findOne({ token: value })
              ]);
              if (!refresh_token) {
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

export const forgotPasswordTokenValidator = validate(
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
                  secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
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
                  secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
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
          options: async (value, { req }) => {
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
                projection: USERS_PROJECTION
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
      fullName: {
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
      },
      gender: {
        optional: true
      },
      phoneNumber: {
        optional: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!PHONE_NUMBER_REGEX.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID);
            }
            const { user_id } = req.decoded_authorization as TokenPayload;
            const user = await databaseService.users.findOne({ phoneNumber: value });
            if (user && user._id.toString() !== user_id) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_EXIST);
            }
            return true;
          }
        }
      },
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

export const addressValidator = validate(
  checkSchema({
    province: provinceSchema,
    district: districtSchema,
    ward: wardSchema,
    street: streetSchema,
    type: {
      custom: {
        options: (value: number) => {
          if (!value) {
            throw new Error(USERS_MESSAGES.ADDRESS_TYPE_IS_REQUIRED);
          }
          if (!Number.isInteger(value)) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.ADDRESS_TYPE_MUST_BE_A_INTEGER,
              status: HTTP_STATUS.BAD_REQUEST
            });
          }
          if (!(value in AddressType)) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.ADDRESS_TYPE_IS_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            });
          }
        }
      }
    }
  })
);

export const addressExistValidator = validate(
  checkSchema(
    {
      address_id: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ADDRESS_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ADDRESS_ID_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const { user_id } = req.decoded_authorization as TokenPayload;
            const address = await databaseService.users.findOne({
              _id: new ObjectId(user_id),
              'addresses._id': new ObjectId(value)
            });
            if (!address) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ADDRESS_NOT_EXIST,
                status: HTTP_STATUS.NOT_FOUND
              });
            }
            return true;
          }
        }
      }
    },
    ['params']
  )
);

export const limitAddressValidator = async (req: Request, res: any, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  if (user.addresses.length >= 3) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ADDRESS_MAXIMUM,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};

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
