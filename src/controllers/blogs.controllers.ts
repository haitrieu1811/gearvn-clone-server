import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  CreateBlogRequestBody,
  DeleteBlogRequestBody,
  GetBlogDetailRequestParams,
  UpdateBlogRequestBody,
  UpdateBlogRequestParams
} from '~/models/requests/Blog.requests';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import blogService from '~/services/blogs.services';

// Tạo blog
export const createBlogController = async (
  req: Request<ParamsDictionary, any, CreateBlogRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await blogService.createBlog({ payload, user_id });
  return res.json(result);
};

// Cập nhật blog
export const updateBlogController = async (
  req: Request<UpdateBlogRequestParams, any, UpdateBlogRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { blog_id } = req.params;
  const result = await blogService.updateBlog({ payload, blog_id });
  return res.json(result);
};

// Xóa blog
export const deleteBlogController = async (
  req: Request<ParamsDictionary, any, DeleteBlogRequestBody>,
  res: Response
) => {
  const { blog_ids } = req.body;
  const result = await blogService.deleteBlogs(blog_ids);
  return res.json(result);
};

// Lấy danh sách blog
export const getBlogListController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const result = await blogService.getBlogs(req.query);
  return res.json(result);
};

// Lấy chi tiết blog
export const getBlogDetailController = async (req: Request<GetBlogDetailRequestParams>, res: Response) => {
  const { blog_id } = req.params;
  const result = await blogService.getBlog(blog_id);
  return res.json(result);
};
