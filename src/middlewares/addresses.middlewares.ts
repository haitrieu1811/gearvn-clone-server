import { NextFunction, Request } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import { AddressType } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

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

const addressTypeSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.ADDRESS_TYPE_IS_REQUIRED
  },
  custom: {
    options: (value: number) => {
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
      return true;
    }
  }
};

const addressDefaultValueSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.ADDRESS_DEFAULT_VALUE_IS_REQUIRED
  },
  isBoolean: {
    errorMessage: USERS_MESSAGES.ADDRESS_DEFAULT_VALUE_MUST_BE_A_BOOLEAN
  }
};

export const addAddressValidator = validate(
  checkSchema(
    {
      province: provinceSchema,
      district: districtSchema,
      ward: wardSchema,
      street: streetSchema,
      type: addressTypeSchema
    },
    ['body']
  )
);

export const updateAddressValidator = validate(
  checkSchema(
    {
      province: provinceSchema,
      district: districtSchema,
      ward: wardSchema,
      street: streetSchema,
      type: addressTypeSchema
    },
    ['body']
  )
);

// Kiểm tra địa chỉ có tồn tại hay không
export const addressExistValidator = validate(
  checkSchema(
    {
      address_id: {
        trim: true,
        custom: {
          options: async (value: string) => {
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
            const address = await databaseService.addresses.findOne({
              _id: new ObjectId(value)
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

// Kiểm tra số lượng địa chỉ của người dùng
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
  (req as Request).user = user;
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

// Kiểm tra địa chỉ có phải là địa chỉ mặc định hay không
export const notDefaultAddressValidator = async (req: Request, res: any, next: NextFunction) => {
  const { address_id } = req.params;
  const address = await databaseService.addresses.findOne({
    _id: new ObjectId(address_id)
  });
  if (address && address.is_default) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ADDRESS_IS_DEFAULT,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};
