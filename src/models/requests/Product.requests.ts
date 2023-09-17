import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

export interface ProductIdRequestParams extends ParamsDictionary {
  product_id: string;
}

// Params: Xóa hình ảnh sản phẩm
export interface DeleteImageRequestParams extends ParamsDictionary {
  media_id: string;
}

// Body: Tạo mới sản phẩm
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
  images?: string[];
}

// Body: Cập nhật sản phẩm
export interface UpdateProductRequestBody {
  name_vi?: string;
  name_en?: string;
  thumbnail: string;
  price?: number;
  price_after_discount?: number;
  general_info?: string;
  description?: string;
  images?: string[];
  brand_id?: string;
  category_id?: string;
  available_count?: number;
}

// Body: Xóa xản phẩm
export interface DeleteProductRequestBody {
  product_ids: ObjectId[];
}

// Query: Lấy danh sách sản phẩm
export interface GetProductListRequestQuery {
  page?: string;
  limit?: string;
  category?: string;
  brand?: string;
  name?: string;
  sortBy?: 'price' | 'created_at' | 'price_after_discount';
  orderBy?: 'asc' | 'desc';
}
