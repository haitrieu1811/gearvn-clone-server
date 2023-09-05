import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

const reviewIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (typeof value !== 'string') {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_ID_MUST_BE_A_STRING,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const review = await databaseService.productReviews.findOne({
        _id: new ObjectId(value)
      });
      if (!review) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      return true;
    }
  }
};

// Thêm đánh giá sản phẩm
export const addReviewValidator = validate(
  checkSchema(
    {
      rating: {
        optional: true,
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_REVIEW_RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value: number, { req }) => {
            const { parent_id } = req.body;
            if (!Number.isInteger(value)) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_REVIEW_RATING_MUST_BE_AN_INTEGER);
            }
            if (value < 1 || value > 5) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_REVIEW_RATING_MUST_BE_BETWEEN_ONE_AND_FIVE);
            }
            if (parent_id) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_ID_MUST_BE_NULL,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            return true;
          }
        }
      },
      comment: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_REVIEW_COMMENT_MUST_BE_A_STRING
        },
        trim: true
      },
      parent_id: {
        ...reviewIdSchema,
        optional: true
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_REVIEW_IMAGES_MUST_BE_AN_STRING_ARRAY
        },
        custom: {
          options: (value: string[]) => {
            const isValid = value.every((item) => typeof item === 'string');
            if (!isValid) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_REVIEW_IMAGES_ITEM_MUST_BE_A_STRING);
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

// Kiểm tra đánh giá sản phẩm có tồn tại không
export const checkReviewExistValidator = validate(
  checkSchema(
    {
      review_id: reviewIdSchema
    },
    ['params']
  )
);
