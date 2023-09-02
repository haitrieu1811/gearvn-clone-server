import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';

import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

export const productIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_ID_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (typeof value !== 'string') {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_STRING,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const product = await databaseService.products.findOne({ _id: new ObjectId(value) });
      if (!product) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      return true;
    }
  }
};

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

const brandIdSchema: ParamSchema = {
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

const categoryIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.CATEGORY_ID_IS_REQUIRED
  },
  isString: {
    errorMessage: PRODUCTS_MESSAGES.CATEGORY_MUST_BE_A_STRING
  },
  trim: true,
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.CATEGORY_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const category = await databaseService.categories.findOne({ _id: new ObjectId(value) });
      if (!category) {
        throw new Error(PRODUCTS_MESSAGES.CATEGORY_NOT_FOUND);
      }
      return true;
    }
  }
};

const reviewIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (typeof value !== 'string') {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_PARENT_ID_MUST_BE_A_STRING,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_PARENT_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const review = await databaseService.productReviews.findOne({
        _id: new ObjectId(value),
        parent_id: null
      });
      if (!review) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_PARENT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        });
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

// Kiểm tra hình ảnh - video có tồn tại trên DB không
export const checkMediaExistValidator = validate(
  checkSchema(
    {
      media_id: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.IMAGE_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.IMAGE_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const image = await databaseService.medias.findOne({ _id: new ObjectId(value) });
            if (!image) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.IMAGE_NOT_FOUND,
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

// Thêm hình ảnh sản phẩm
export const addImageValidator = validate(
  checkSchema(
    {
      images: {
        custom: {
          options: (value: string[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.IMAGES_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.IMAGES_MUST_BE_AN_ARRAY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const valid = value.every((item) => typeof item === 'string');
            if (!valid) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.IMAGES_ITEM_MUST_BE_A_STRING,
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

// Kiểm tra sản phẩm có tồn tại không
export const checkProductExist = validate(
  checkSchema(
    {
      product_id: productIdSchema
    },
    ['params']
  )
);

// Tạo mới sản phẩm
export const createProductValidator = validate(
  checkSchema(
    {
      name_vi: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_MUST_IS_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 12,
            max: 500
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_LENGTH
        }
      },
      name_en: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_MUST_IS_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 12,
            max: 500
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_LENGTH
        }
      },
      thumbnail: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_THUMBNAIL_MUST_BE_A_STRING
        },
        trim: true
      },
      price: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_MUST_BE_A_NUMBER
        }
      },
      price_after_discount: {
        optional: true,
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value: number, { req }) => {
            if (value > req.body.price) {
              new Error(PRODUCTS_MESSAGES.PRICE_AFTER_DISCOUNT_MUST_LESS_THAN);
            }
            return true;
          }
        }
      },
      general_info: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_GENERAL_INFO_MUST_BE_A_STRING
        },
        trim: true
      },
      description: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_DESCRIPTION_MUST_BE_A_STRING
        },
        trim: true
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_IMAGES_MUST_BE_AN_STRING_ARRAY
        }
      },
      brand_id: brandIdSchema,
      category_id: categoryIdSchema,
      specifications: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_SPECIFICATIONS_MUST_BE_A_STRING
        },
        trim: true
      },
      available_count: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_AVAILABLE_COUNT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_AVAILABLE_COUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value: number) => {
            if (value < 0) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_AVAILABLE_COUNT_MUST_BE_GREATER_OR_EQUAL_ZERO);
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);

// Cập nhật sản phẩm
export const updateProductValidator = validate(
  checkSchema(
    {
      name_vi: {
        optional: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_MUST_IS_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 12,
            max: 500
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_LENGTH
        }
      },
      name_en: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_MUST_IS_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 12,
            max: 500
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_LENGTH
        }
      },
      thumbnail: {
        optional: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_THUMBNAIL_IS_REQUIRED
        },
        isURL: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_THUMBNAIL_MUST_BE_A_STRING
        },
        trim: true
      },
      price: {
        optional: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_MUST_BE_A_NUMBER
        }
      },
      price_after_discount: {
        optional: true,
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_MUST_BE_A_NUMBER
        }
      },
      general_info: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_GENERAL_INFO_MUST_BE_A_STRING
        },
        trim: true
      },
      description: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_DESCRIPTION_MUST_BE_A_STRING
        },
        trim: true
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_IMAGES_MUST_BE_AN_STRING_ARRAY
        }
      },
      brand_id: {
        ...brandIdSchema,
        optional: true
      },
      category_id: {
        ...categoryIdSchema,
        optional: true
      },
      specifications: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_SPECIFICATIONS_MUST_BE_A_STRING
        },
        trim: true
      },
      available_count: {
        optional: true,
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_AVAILABLE_COUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value: number) => {
            if (value < 0) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_AVAILABLE_COUNT_MUST_BE_GREATER_OR_EQUAL_ZERO);
            }
            return true;
          }
        }
      }
    },
    ['body']
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

// Xóa sản phẩm
export const deleteProductValidator = validate(
  checkSchema(
    {
      product_ids: {
        custom: {
          options: (value: ObjectId[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_IDS_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_IDS_MUST_BE_AN_ARRAY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value.length <= 0) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_IDS_NOT_EMPTY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const isValid = value.every((item) => ObjectId.isValid(item));
            if (!isValid) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_IDS_IS_INVALID,
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
                message: PRODUCTS_MESSAGES.PRODUCT_REVIEW_PARENT_ID_MUST_BE_NULL,
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
