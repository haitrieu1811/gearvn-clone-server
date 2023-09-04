import { ParamsDictionary } from 'express-serve-static-core';

export interface ServeImageRequestParams extends ParamsDictionary {
  name: string;
}

export interface ImageIdRequestParams extends ParamsDictionary {
  image_id: string;
}

export interface DeleteMediasRequestBody {
  media_ids: string[];
}
