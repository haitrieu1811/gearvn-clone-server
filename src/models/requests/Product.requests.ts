import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

// Brand
export interface GetBrandsRequestQuery {
  page?: string;
  limit?: string;
}

export interface GetBrandRequestParams extends ParamsDictionary {
  brand_id: string;
}

export interface CreateBrandRequestBody {
  name: string;
}

export interface UpdateBrandRequestBody {
  name: string;
}

export interface UpdateBrandRequestParams extends ParamsDictionary {
  brand_id: string;
}

export interface DeleteBrandRequestBody {
  brand_ids: ObjectId[];
}

// Image
export interface AddImageRequestBody {
  images: string[];
}

export interface AddImageRequestParams extends ParamsDictionary {
  product_id: string;
}

export interface DeleteImageRequestParams extends ParamsDictionary {
  media_id: string;
}

// Product
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

export interface DeleteProductRequestBody {
  product_ids: ObjectId[];
}

export interface GetProductListRequestQuery {
  page?: string;
  limit?: string;
}

export interface GetProductDetailRequestParams extends ParamsDictionary {
  product_id: string;
}
