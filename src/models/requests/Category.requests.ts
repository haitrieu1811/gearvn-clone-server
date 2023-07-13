import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

export interface GetCategoriesRequestQuery {
  page?: string;
  limit?: string;
}

export interface CreateCategoryRequestBody {
  name_vi: string;
  name_en: string;
}

export interface GetCategoryRequestParams extends ParamsDictionary {
  category_id: string;
}

export interface UpdateCategoryRequestBody {
  name_vi: string;
  name_en: string;
}

export interface UpdateCategoryRequestParams extends ParamsDictionary {
  category_id: string;
}

export interface DeleteCategoriesRequestBody {
  category_ids: ObjectId[];
}
