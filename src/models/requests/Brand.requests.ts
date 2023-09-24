import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

// Params: brand_id
export interface BrandIdRequestParams extends ParamsDictionary {
  brand_id: string;
}

// Body: Tạo mới nhãn hiệu
export interface CreateBrandRequestBody {
  name: string;
}

// Body: Xóa nhãn hiệu
export interface DeleteBrandRequestBody {
  brand_ids: ObjectId[];
}
