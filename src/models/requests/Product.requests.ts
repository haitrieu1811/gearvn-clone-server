import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

export interface CreateBrandRequestBody {
  name: string;
}

export interface UpdateBrandRequestBody {
  name: string;
}

export interface UpdateBrandRequestParams extends ParamsDictionary {
  brand_id: string;
}

export interface DeleteBrandRequestParams extends ParamsDictionary {
  brand_id: string;
}

export interface AddImageRequestBody {
  images: string[];
}

export interface AddImageRequestParams extends ParamsDictionary {
  product_id: string;
}

export interface DeleteImageRequestParams extends ParamsDictionary {
  media_id: string;
}

export interface CreateProductRequestBody {
  name_vi: string;
  name_en?: string;
  thumbnail: string;
  price: number;
  price_after_discount?: number;
  general_info?: string;
  description?: string;
  images?: ObjectId[];
  brand_id: ObjectId;
  category_id: ObjectId;
  specifications?: string;
}

export interface UpdateProductRequestBody {
  name_vi: string;
  name_en?: string;
  thumbnail: string;
  price: number;
  price_after_discount?: number;
  general_info?: string;
  description?: string;
  images?: ObjectId[];
  brand_id: ObjectId;
  category_id: ObjectId;
  specifications?: string;
}

export interface UpdateProductRequestParams extends ParamsDictionary {
  product_id: string;
}

export interface DeleteProductRequestParams extends ParamsDictionary {
  product_id: string;
}

export interface GetProductListRequestQuery {
  page?: number | string;
  limit?: number | string;
}

export interface GetProductDetailRequestParams extends ParamsDictionary {
  product_id: string;
}
