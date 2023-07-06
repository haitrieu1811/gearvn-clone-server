import { ParamSchema, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';

import { BlogStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { BLOGS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import { validate } from '~/utils/validation';

const thumbnailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BLOGS_MESSAGES.THUMBNAIL_IS_REQUIRED
  },
  isString: {
    errorMessage: BLOGS_MESSAGES.THUMBNAIL_MUST_BE_A_STRING
  },
  trim: true
};

const nameViSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BLOGS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: BLOGS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true
};

const nameEnSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: BLOGS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true
};

const contentViSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BLOGS_MESSAGES.CONTENT_IS_REQUIRED
  },
  isString: {
    errorMessage: BLOGS_MESSAGES.CONTENT_MUST_BE_A_STRING
  },
  trim: true
};

const contentEnSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: BLOGS_MESSAGES.CONTENT_MUST_BE_A_STRING
  },
  trim: true
};

export const blogExistValidator = validate(
  checkSchema(
    {
      blog_id: {
        custom: {
          options: async (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: BLOGS_MESSAGES.BLOG_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: BLOGS_MESSAGES.BLOG_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const blog = await databaseService.blogs.findOne({ _id: new ObjectId(value) });
            if (!blog) {
              throw new ErrorWithStatus({
                message: BLOGS_MESSAGES.BLOG_NOT_FOUND,
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

export const createBlogValidator = validate(
  checkSchema(
    {
      thumbnail: thumbnailSchema,
      name_vi: nameViSchema,
      name_en: nameEnSchema,
      content_vi: contentViSchema,
      content_en: contentEnSchema
    },
    ['body']
  )
);

export const updateBlogValidator = validate(
  checkSchema(
    {
      thumbnail: {
        ...thumbnailSchema,
        optional: true
      },
      name_vi: {
        ...nameViSchema,
        optional: true
      },
      name_en: nameEnSchema,
      content_vi: {
        ...contentViSchema,
        optional: true
      },
      content_en: contentEnSchema,
      status: {
        optional: true,
        custom: {
          options: (value) => {
            if (!(value in BlogStatus)) {
              throw new Error(BLOGS_MESSAGES.STATUS_IS_INVALID);
            }
            return true;
          }
        }
      }
    },
    ['body']
  )
);
