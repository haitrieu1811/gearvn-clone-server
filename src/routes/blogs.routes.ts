import { Router } from 'express';

import { createBlogController, deleteBlogController, updateBlogController } from '~/controllers/blogs.controllers';
import { blogExistValidator, createBlogValidator, updateBlogValidator } from '~/middlewares/blogs.middlewares';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { CreateBlogRequestBody, UpdateBlogRequestBody } from '~/models/requests/Blog.requests';
import { wrapRequestHandler } from '~/utils/handler';

const blogsRouter = Router();

blogsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  createBlogValidator,
  filterReqBodyMiddleware<CreateBlogRequestBody>(['content_en', 'content_vi', 'name_en', 'name_vi', 'thumbnail']),
  wrapRequestHandler(createBlogController)
);
blogsRouter.patch(
  '/:blog_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  blogExistValidator,
  updateBlogValidator,
  filterReqBodyMiddleware<UpdateBlogRequestBody>([
    'content_en',
    'content_vi',
    'name_en',
    'name_vi',
    'thumbnail',
    'status'
  ]),
  wrapRequestHandler(updateBlogController)
);
blogsRouter.delete(
  '/:blog_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  blogExistValidator,
  wrapRequestHandler(deleteBlogController)
);

export default blogsRouter;
