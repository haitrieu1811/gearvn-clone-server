import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

// Lấy danh sách nhãn hiệu (query)
export interface GetBrandsRequestQuery {
  page?: string;
  limit?: string;
}

// Lấy thông tin chi tiết nhãn hiệu (params)
export interface GetBrandRequestParams extends ParamsDictionary {
  brand_id: string;
}

// Tạo mới nhãn hiệu (body)
export interface CreateBrandRequestBody {
  name: string;
}

// Cập nhật nhãn hiệu (body)
export interface UpdateBrandRequestBody {
  name: string;
}

// Cập nhận nhãn hiệu (params)
export interface UpdateBrandRequestParams extends ParamsDictionary {
  brand_id: string;
}

// Xóa nhãn hiệu (body)
export interface DeleteBrandRequestBody {
  brand_ids: ObjectId[];
}

// Thêm hình ảnh sản phẩm (body)
export interface AddImageRequestBody {
  images: string[];
}

// Thêm hình ảnh sản phẩm (params)
export interface AddImageRequestParams extends ParamsDictionary {
  product_id: string;
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
  specifications?: string;
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
  specifications?: string;
}

// Cập nhật sản phẩm (params)
export interface UpdateProductRequestParams extends ParamsDictionary {
  product_id: string;
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

// Lấy thông tin chi tiết sản phẩm (params)
export interface GetProductDetailRequestParams extends ParamsDictionary {
  product_id: string;
}
