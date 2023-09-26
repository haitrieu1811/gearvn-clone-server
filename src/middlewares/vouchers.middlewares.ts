import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import { VoucherDiscountUnit } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { VOUCHERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { numberEnumToArray } from '~/utils/commons';
import { validate } from '~/utils/validation';

const voucherDiscountUnits = numberEnumToArray(VoucherDiscountUnit);

// Đơn vị giảm giá (price, percentage)
const discountUnitSchema: ParamSchema = {
  notEmpty: {
    errorMessage: VOUCHERS_MESSAGES.VOUCHER_DISCOUNT_UNIT_IS_REQUIRED
  },
  isIn: {
    options: [voucherDiscountUnits],
    errorMessage: VOUCHERS_MESSAGES.VOUCHER_DISCOUNT_UNIT_IS_INVALID
  }
};

// Voucher code
const voucherCodeSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: VOUCHERS_MESSAGES.VOUCHER_CODE_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      if (typeof value !== 'string') {
        throw new ErrorWithStatus({
          message: VOUCHERS_MESSAGES.VOUCHER_CODE_MUST_BE_A_IS_STRING,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      const voucher = await databaseService.vouchers.findOne({ code: value });
      if (!voucher) {
        throw new ErrorWithStatus({
          message: VOUCHERS_MESSAGES.VOUCHER_IS_INVALID,
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      if (voucher.is_used) {
        throw new ErrorWithStatus({
          message: VOUCHERS_MESSAGES.VOUCHER_IS_USED,
          status: HTTP_STATUS.BAD_REQUEST
        });
      }
      return true;
    }
  }
};

// Kiểm tra voucher ID
export const voucherIdValidator = validate(
  checkSchema(
    {
      voucher_id: {
        notEmpty: {
          errorMessage: VOUCHERS_MESSAGES.VOUCHER_ID_IS_REQUIRED
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.VOUCHER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const voucher = await databaseService.vouchers.findOne({ _id: new ObjectId(value) });
            if (!voucher) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.VOUCHER_NOT_FOUND,
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

// Kiểm tra voucher code
export const voucherCodeValidator = validate(
  checkSchema(
    {
      voucher_code: voucherCodeSchema
    },
    ['params']
  )
);

// Thêm voucher
export const createVoucherValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: {
          errorMessage: VOUCHERS_MESSAGES.VOUCHER_NAME_MUST_BE_A_IS_STRING
        },
        trim: true
      },
      description: {
        optional: true,
        isString: {
          errorMessage: VOUCHERS_MESSAGES.VOUCHER_DESCRIPTION_MUST_BE_A_IS_STRING
        },
        trim: true
      },
      discount: {
        notEmpty: {
          errorMessage: VOUCHERS_MESSAGES.VOUCHER_DISCOUNT_IS_REQUIRED
        },
        custom: {
          options: (value: number, { req }) => {
            const { discount_unit } = req.body;
            if (typeof value !== 'number') {
              throw new Error(VOUCHERS_MESSAGES.VOUCHER_DISCOUNT_MUST_BE_A_NUMERIC);
            }
            if (value < 0) {
              throw new Error(VOUCHERS_MESSAGES.VOUCHER_DISCOUNT_MUST_BE_A_POSITIVE_NUMBER);
            }
            if (discount_unit === VoucherDiscountUnit.Percentage && value > 100) {
              throw new Error(VOUCHERS_MESSAGES.VOUCHER_DISCOUNT_MUST_BE_LESS_THAN_100_PERCENT);
            }
            return true;
          }
        }
      },
      discount_unit: discountUnitSchema,
      code: {
        notEmpty: {
          errorMessage: VOUCHERS_MESSAGES.VOUCHER_CODE_IS_REQUIRED
        },
        isString: {
          errorMessage: VOUCHERS_MESSAGES.VOUCHER_CODE_MUST_BE_A_IS_STRING
        },
        custom: {
          options: async (value: string) => {
            const voucher = await databaseService.vouchers.findOne({ code: value });
            if (voucher) {
              throw new Error(VOUCHERS_MESSAGES.VOUCHER_CODE_IS_EXISTED);
            }
            return true;
          }
        },
        trim: true
      }
    },
    ['body']
  )
);

// Cập nhật voucher
export const updateVoucherValidator = createVoucherValidator;

// Lấy danh sách voucher
export const getVouchersValidator = validate(
  checkSchema(
    {
      unit: {
        ...discountUnitSchema,
        optional: true,
        notEmpty: undefined
      }
    },
    ['query']
  )
);

// Xóa voucher (có thể xóa nhiều voucher cùng lúc)
export const deleteVouchersValidator = validate(
  checkSchema(
    {
      voucher_ids: {
        custom: {
          options: (value: string[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.VOUCHER_IDS_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.VOUCHER_IDS_MUST_BE_AN_ARRAY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value.length === 0) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.VOUCHER_IDS_MUST_HAVE_AT_LEAST_ONE_ELEMENT,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const isValid = value.every((id) => ObjectId.isValid(id));
            if (!isValid) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.VOUCHER_IDS_IS_INVALID,
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

// Áp dụng voucher
export const applyVoucherValidator = validate(
  checkSchema(
    {
      voucher_code: voucherCodeSchema,
      original_price: {
        custom: {
          options: (value: number) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.ORIGINAL_PRICE_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (typeof value !== 'number') {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.ORIGINAL_PRICE_MUST_BE_A_NUMERIC,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (value < 0) {
              throw new ErrorWithStatus({
                message: VOUCHERS_MESSAGES.ORIGINAL_PRICE_MUST_BE_A_POSITIVE_NUMBER,
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
