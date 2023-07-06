import { ParamsDictionary } from 'express-serve-static-core';
import { BlogStatus } from '~/constants/enum';

export interface CreateBlogRequestBody {
  thumbnail: string;
  name_vi: string;
  name_en?: string;
  content_vi: string;
  content_en?: string;
}

export interface UpdateBlogRequestBody {
  thumbnail?: string;
  name_vi?: string;
  name_en?: string;
  content_vi: string;
  content_en?: string;
  status?: BlogStatus;
}

export interface UpdateBlogRequestParams extends ParamsDictionary {
  blog_id: string;
}

export interface DeleteBlogRequestParams extends ParamsDictionary {
  blog_id: string;
}
