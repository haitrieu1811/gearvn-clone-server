import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { PURCHASES_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';
import { productIdSchema } from './common.middlewares';
import { districtSchema, provinceSchema, streetSchema, wardSchema } from './users.middlewares';

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

export const addToCartValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      buy_count: buyCountSchema
    },
    ['body']
  )
);

export const checkPurchaseExist = validate(
  checkSchema(
    {
      purchase_id: purchaseIdSchema
    },
    ['params']
  )
);

export const updatePurchaseValidator = validate(
  checkSchema(
    {
      buy_count: buyCountSchema
    },
    ['body']
  )
);

export const deletePurchaseValidator = validate(
  checkSchema(
    {
      purchase_ids: purchaseIdsSchema
    },
    ['body']
  )
);

export const checkoutValidator = validate(
  checkSchema(
    {
      purchase_ids: purchaseIdsSchema,
      province: provinceSchema,
      district: districtSchema,
      ward: wardSchema,
      street: streetSchema
    },
    ['body']
  )
);
