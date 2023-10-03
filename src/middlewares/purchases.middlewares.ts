import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import { OrderStatus, PaymentMethod, ReceiveMethod } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { PURCHASES_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { numberEnumToArray } from '~/utils/commons';
import { validate } from '~/utils/validation';
import { districtSchema, provinceSchema, streetSchema, wardSchema } from './addresses.middlewares';
import { productIdSchema } from './products.middlewares';
import { fullNameSchema, genderSchema, phoneNumberSchema } from './users.middlewares';

const receiveMethods = numberEnumToArray(ReceiveMethod);
const paymentMethods = numberEnumToArray(PaymentMethod);
const orderStatus = numberEnumToArray(OrderStatus);

const buyCountSchema: ParamSchema = {
  custom: {
    options: (value: number) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.BUY_COUNT_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!Number.isInteger(value)) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.BUY_COUNT_MUST_BE_A_INTEGER,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (value <= 0) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.BUY_COUNT_MUST_BE_GREATER_THAN_0,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      return true;
    }
  }
};

const purchaseIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_ID_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const purchase = await databaseService.purchases.findOne({ _id: new ObjectId(value) });
      if (!purchase) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      return true;
    }
  }
};

const purchaseIdsSchema: ParamSchema = {
  custom: {
    options: async (value: ObjectId[]) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_IDS_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (!Array.isArray(value)) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_IDS_MUST_BE_AN_ARRAY,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (value.length <= 0) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_IDS_LENGTH,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const isValid = value.every((id) => typeof id === 'string' && ObjectId.isValid(id));
      if (!isValid) {
        throw new ErrorWithStatus({
          message: PURCHASES_MESSAGES.PURCHASE_IDS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      return true;
    }
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCartValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      buy_count: buyCountSchema
    },
    ['body']
  )
);

// Kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa
export const checkPurchaseExist = validate(
  checkSchema(
    {
      purchase_id: purchaseIdSchema
    },
    ['params']
  )
);

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updatePurchaseValidator = validate(
  checkSchema(
    {
      buy_count: buyCountSchema
    },
    ['body']
  )
);

// Xóa sản phẩm trong giỏ hàng
export const deletePurchaseValidator = validate(
  checkSchema(
    {
      purchase_ids: purchaseIdsSchema
    },
    ['body']
  )
);

// Thanh toán
export const checkoutValidator = validate(
  checkSchema(
    {
      purchases: purchaseIdsSchema,
      customer_gender: genderSchema,
      customer_name: fullNameSchema,
      customer_phone: phoneNumberSchema,
      province: provinceSchema,
      district: districtSchema,
      ward: wardSchema,
      street: streetSchema,
      note: {
        optional: true,
        isString: {
          errorMessage: PURCHASES_MESSAGES.NOTE_MUST_BE_A_STRING
        },
        isLength: {
          errorMessage: PURCHASES_MESSAGES.NOTE_LENGTH,
          options: { max: 250 }
        },
        trim: true
      },
      transport_fee: {
        optional: true,
        isNumeric: {
          errorMessage: PURCHASES_MESSAGES.TRANSPORT_FEE_MUST_BE_A_NUMBER
        }
      },
      total_amount_before_discount: {
        notEmpty: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_AMOUNT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_AMOUNT_MUST_BE_A_NUMBER
        }
      },
      total_amount: {
        notEmpty: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_AMOUNT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_AMOUNT_MUST_BE_A_NUMBER
        }
      },
      total_amount_reduced: {
        optional: true,
        isNumeric: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_AMOUNT_REDUCED_MUST_BE_A_NUMBER
        }
      },
      total_items: {
        notEmpty: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_ITEMS_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: PURCHASES_MESSAGES.TOTAL_ITEMS_MUST_BE_A_NUMBER
        }
      },
      receive_method: {
        notEmpty: {
          errorMessage: PURCHASES_MESSAGES.RECEIVE_METHOD_IS_REQUIRED
        },
        isIn: {
          errorMessage: PURCHASES_MESSAGES.RECEIVE_METHOD_INVALID,
          options: [receiveMethods]
        }
      },
      payment_method: {
        notEmpty: {
          errorMessage: PURCHASES_MESSAGES.PAYMENT_METHOD_IS_REQUIRED
        },
        isIn: {
          errorMessage: PURCHASES_MESSAGES.PAYMENT_METHOD_INVALID,
          options: [paymentMethods]
        }
      },
      status: {
        optional: true,
        isIn: {
          errorMessage: PURCHASES_MESSAGES.STATUS_INVALID,
          options: [orderStatus]
        }
      }
    },
    ['body']
  )
);
