import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  CreateBlogRequestBody,
  DeleteBlogRequestBody,
  GetBlogDetailRequestParams,
  GetBlogListRequestQuery,
  UpdateBlogRequestBody,
  UpdateBlogRequestParams
} from '~/models/requests/Blog.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import blogService from '~/services/blogs.services';

export const createBlogController = async (
  req: Request<ParamsDictionary, any, CreateBlogRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await blogService.create({ payload, user_id });
  return res.json(result);
};

export const updateBlogController = async (
  req: Request<UpdateBlogRequestParams, any, UpdateBlogRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { blog_id } = req.params;
  const result = await blogService.update({ payload, blog_id });
  return res.json(result);
};

export const deleteBlogController = async (
  req: Request<ParamsDictionary, any, DeleteBlogRequestBody>,
  res: Response
) => {
  const { blog_ids } = req.body;
  const result = await blogService.delete(blog_ids);
  return res.json(result);
};

export const getBlogListController = async (
  req: Request<ParamsDictionary, any, any, GetBlogListRequestQuery>,
  res: Response
) => {
  const result = await blogService.getList(req.query);
  return res.json(result);
};

export const getBlogDetailController = async (req: Request<GetBlogDetailRequestParams>, res: Response) => {
  const { blog_id } = req.params;
  const result = await blogService.getDetail(blog_id);
  return res.json(result);
};
