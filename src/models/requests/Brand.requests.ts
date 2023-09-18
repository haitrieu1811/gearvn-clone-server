import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

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
