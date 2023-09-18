import { checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import { OrderStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { ORDERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

// Kiểm tra đơn hàng có tồn tại hay không
export const orderExistValidator = validate(
  checkSchema(
    {
      order_id: {
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ORDERS_MESSAGES.ORDER_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: ORDERS_MESSAGES.ORDER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const order = await databaseService.orders.findOne({ _id: new ObjectId(value) });
            if (!order) {
              throw new ErrorWithStatus({
                message: ORDERS_MESSAGES.ORDER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              });
            }
          }
        }
      }
    },
    ['params']
  )
);

// Kiểm tra trạng thái đơn hàng có hợp lệ hay không
export const updateStatusValidator = validate(
  checkSchema(
    {
      status: {
        custom: {
          options: (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ORDERS_MESSAGES.STATUS_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!(value in OrderStatus)) {
              throw new ErrorWithStatus({
                message: ORDERS_MESSAGES.STATUS_IS_INVALID,
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

// Xóa một hoặc nhiều đơn hàng
export const deleteOrdersValidator = validate(
  checkSchema({
    order_ids: {
      custom: {
        options: async (value: string[]) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: ORDERS_MESSAGES.ORDER_IDS_IS_REQUIRED,
              status: HTTP_STATUS.BAD_REQUEST
            });
          }
          if (!Array.isArray(value)) {
            throw new ErrorWithStatus({
              message: ORDERS_MESSAGES.ORDER_IDS_MUST_BE_AN_ARRAY,
              status: HTTP_STATUS.BAD_REQUEST
            });
          }
          if (value.length === 0) {
            throw new ErrorWithStatus({
              message: ORDERS_MESSAGES.ORDER_IDS_MUST_HAVE_AT_LEAST_ONE_ELEMENT,
              status: HTTP_STATUS.BAD_REQUEST
            });
          }
          const isValid = value.every((order_id) => ObjectId.isValid(order_id));
          if (!isValid) {
            throw new ErrorWithStatus({
              message: ORDERS_MESSAGES.ORDER_IDS_IS_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            });
          }
          return true;
        }
      }
    }
  })
);
