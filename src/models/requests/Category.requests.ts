import { ParamsDictionary } from 'express-serve-static-core';

export interface CreateCategoryRequestBody {
  name_vi: string;
  name_en: string;
}

export interface UpdateCategoryRequestBody {
  name_vi: string;
  name_en: string;
}

export interface UpdateCategoryRequestParams extends ParamsDictionary {
  category_id: string;
}

export interface DeleteCategoryRequestParams extends ParamsDictionary {
  category_id: string;
}