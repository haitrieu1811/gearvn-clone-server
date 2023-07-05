import { NextFunction, Request, Response } from 'express';
import pick from 'lodash/pick';
import { ObjectId } from 'mongodb';
import { ParamSchema } from 'express-validator';

import { ErrorWithStatus } from '~/models/Errors';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import databaseService from '~/services/database.services';
import HTTP_STATUS from '~/constants/httpStatus';

type FilterKeys<T> = Array<keyof T>;

export const filterReqBodyMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys);
    next();
  };

export const productIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_ID_IS_REQUIRED,
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
