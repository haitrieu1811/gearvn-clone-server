import { Router } from 'express';

import {
  createBlogController,
  deleteBlogController,
  getBlogDetailController,
  getBlogListController,
  updateBlogController
} from '~/controllers/blogs.controllers';
import {
  blogExistValidator,
  createBlogValidator,
  deleteBlogValidator,
  updateBlogValidator
} from '~/middlewares/blogs.middlewares';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { CreateBlogRequestBody, UpdateBlogRequestBody } from '~/models/requests/Blog.requests';
import { wrapRequestHandler } from '~/utils/handler';

const blogsRouter = Router();

// Tạo blog
blogsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  createBlogValidator,
  filterReqBodyMiddleware<CreateBlogRequestBody>(['content_en', 'content_vi', 'name_en', 'name_vi', 'thumbnail']),
  wrapRequestHandler(createBlogController)
);

// Cập nhật blog
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

// Xoá blog
blogsRouter.delete(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  deleteBlogValidator,
  wrapRequestHandler(deleteBlogController)
);

// Lấy danh sách blog
blogsRouter.get('/', wrapRequestHandler(getBlogListController));

// Lấy chi tiết blog
blogsRouter.get('/:blog_id', blogExistValidator, wrapRequestHandler(getBlogDetailController));

export default blogsRouter;
