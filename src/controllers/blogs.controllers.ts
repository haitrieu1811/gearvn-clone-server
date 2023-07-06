import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  CreateBlogRequestBody,
  DeleteBlogRequestParams,
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

export const deleteBlogController = async (req: Request<DeleteBlogRequestParams>, res: Response) => {
  const { blog_id } = req.params;
  const result = await blogService.delete(blog_id);
  return res.json(result);
};
