import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';

import { CATEGORIES_MESSAGES } from '~/constants/messages';
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

const nameViSchema: ParamSchema = {
  ...nameSchema
  // custom: {
  //   options: async (value: string) => {
  //     const category = await databaseService.categories.findOne({ name_vi: value });
  //     if (category) {
  //       throw new Error(CATEGORIES_MESSAGES.NAME_IS_EXIST);
  //     }
  //     return true;
  //   }
  // }
};

const nameEnSchema: ParamSchema = {
  ...nameSchema
  // custom: {
  //   options: async (value: string) => {
  //     const category = await databaseService.categories.findOne({ name_en: value });
  //     if (category) {
  //       throw new Error(CATEGORIES_MESSAGES.NAME_IS_EXIST);
  //     }
  //     return true;
  //   }
  // }
};

export const createValidator = validate(
  checkSchema(
    {
      name_vi: nameViSchema,
      name_en: nameEnSchema
    },
    ['body']
  )
);

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

export const updateValidator = validate(
  checkSchema(
    {
      name_vi: {
        ...nameViSchema,
        optional: true
      },
      name_en: {
        ...nameEnSchema,
        optional: true
      }
    },
    ['body']
  )
);
