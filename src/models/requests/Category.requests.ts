import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

export interface CreateCategoryRequestBody {
  name_vi: string;
  name_en: string;
}

export interface CategoryIdRequestParams extends ParamsDictionary {
  category_id: string;
}

export interface DeleteCategoriesRequestBody {
  category_ids: ObjectId[];
}
