import { checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '~/constants/httpStatus';
import { MEDIAS_MESSAGES, PRODUCTS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

// Xóa media ở S3 và xóa thông tin media trong database
export const deleteMediasValidator = validate(
  checkSchema(
    {
      media_ids: {
        notEmpty: {
          errorMessage: MEDIAS_MESSAGES.MEDIA_IDS_IS_REQUIRED
        },
        isArray: {
          errorMessage: MEDIAS_MESSAGES.MEDIA_IDS_MUST_BE_ARRAY
        },
        custom: {
          options: (value: string[]) => {
            if (value.length <= 0) {
              throw new ErrorWithStatus({
                message: MEDIAS_MESSAGES.MEDIA_IDS_MUST_BE_ARRAY_AND_NOT_EMPTY,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const isValid = value.every((item) => ObjectId.isValid(item));
            if (!isValid) {
              throw new ErrorWithStatus({
                message: MEDIAS_MESSAGES.MEDIA_IDS_MUST_BE_ARRAY_OF_OBJECT_ID,
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
