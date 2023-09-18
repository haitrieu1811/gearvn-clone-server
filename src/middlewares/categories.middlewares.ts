import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';

import { CATEGORIES_MESSAGES, PRODUCTS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: CATEGORIES_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: CATEGORIES_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 160
    },
    errorMessage: CATEGORIES_MESSAGES.CATEGORY_NAME_LENGTH
  }
};

// Tạo danh mục sản phẩm
export const createCategoryValidator = validate(
  checkSchema(
    {
      name_vi: nameSchema,
      name_en: nameSchema
    },
    ['body']
  )
);

// Kiểm tra danh mục tồn tại
export const categoryExistValidator = validate(
  checkSchema(
    {
      category_id: {
        notEmpty: {
          errorMessage: CATEGORIES_MESSAGES.CATEGORY_ID_IS_REQUIRED
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(CATEGORIES_MESSAGES.CATEGORY_ID_INVALID);
            }
            const category = await databaseService.categories.findOne({ _id: new ObjectId(value) });
            if (!category) {
              throw new ErrorWithStatus({
                message: CATEGORIES_MESSAGES.CATEGORY_NOT_FOUND,
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

// Cập nhật danh mục sản phẩm
export const updateCategoryValidator = validate(
  checkSchema(
    {
      name_vi: {
        ...nameSchema,
        optional: true
      },
      name_en: {
        ...nameSchema,
        optional: true
      }
    },
    ['body']
  )
);

// Xóa danh mục sản phẩm
export const deleteCategoryValidator = validate(
  checkSchema(
    {
      category_ids: {
        custom: {
          options: (value: ObjectId[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.CATEGORY_IDS_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.CATEGORY_IDS_MUST_BE_AN_ARRAY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value.length <= 0) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.CATEGORY_IDS_NOT_EMPTY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const isValid = value.every((id) => ObjectId.isValid(id));
            if (!isValid) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.CATEGORY_IDS_IS_INVALID,
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
