import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

const brandNameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.BRAND_NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: PRODUCTS_MESSAGES.BRAND_NAME_MUST_BE_A_STRING
  },
  trim: true,
  custom: {
    options: async (value: string) => {
      const brand = await databaseService.brands.findOne({ name: value });
      if (brand) {
        throw new Error(PRODUCTS_MESSAGES.BRAND_IS_EXIST);
      }
      return true;
    }
  }
};

export const brandIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.BRAND_ID_IS_REQUIRED
  },
  isString: {
    errorMessage: PRODUCTS_MESSAGES.BRAND_ID_MUST_BE_A_STRING
  },
  trim: true,
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.BRAND_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const brand = await databaseService.brands.findOne({ _id: new ObjectId(value) });
      if (!brand) {
        throw new Error(PRODUCTS_MESSAGES.BRAND_NOT_FOUND);
      }
      return true;
    }
  }
};

// Tạo nhãn hiệu
export const createBrandValidator = validate(
  checkSchema(
    {
      name: brandNameSchema
    },
    ['body']
  )
);

// Cập nhật nhãn hiệu
export const updateBrandValidator = validate(
  checkSchema(
    {
      name: brandNameSchema
    },
    ['body']
  )
);

// Kiểm tra nhãn hiệu có tồn tại trên DB không
export const checkBrandExistValidator = validate(
  checkSchema(
    {
      brand_id: {
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const brand = await databaseService.brands.findOne({ _id: new ObjectId(value) });
            if (!brand) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_NOT_FOUND,
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

// Xóa nhãn hiệu
export const deleteBrandValidator = validate(
  checkSchema(
    {
      brand_ids: {
        custom: {
          options: (value: ObjectId[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_IDS_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_IDS_MUST_BE_AN_ARRAY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value.length <= 0) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_IDS_NOT_EMPTY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const isValid = value.every((item) => ObjectId.isValid(item));
            if (!isValid) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_IDS_IS_INVALID,
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
