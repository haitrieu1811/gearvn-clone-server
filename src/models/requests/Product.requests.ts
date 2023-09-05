import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

export interface ProductIdRequestParams extends ParamsDictionary {
  product_id: string;
}

// Thêm hình ảnh sản phẩm (body)
export interface AddImageRequestBody {
  images: string[];
}

// Xóa hình ảnh sản phẩm (params)
export interface DeleteImageRequestParams extends ParamsDictionary {
  media_id: string;
}

// Tạo mới sản phẩm (body)
export interface CreateProductRequestBody {
  name_vi: string;
  name_en?: string;
  thumbnail: string;
  price: number;
  price_after_discount?: number;
  general_info?: string;
  description?: string;
  brand_id: ObjectId;
  category_id: ObjectId;
  available_count: number;
}

// Cập nhật sản phẩm (body)
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
  available_count: number;
}

// Xóa xản phẩm (body)
export interface DeleteProductRequestBody {
  product_ids: ObjectId[];
}

// Lấy danh sách sản phẩm (query)
export interface GetProductListRequestQuery {
  page?: string;
  limit?: string;
  category?: string;
  brand?: string;
  name?: string;
  sortBy?: 'price' | 'created_at' | 'price_after_discount';
  orderBy?: 'asc' | 'desc';
}
