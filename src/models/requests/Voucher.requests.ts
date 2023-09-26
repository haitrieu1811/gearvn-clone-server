import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

import { VoucherDiscountUnit } from '~/constants/enum';
import { PaginationRequestQuery } from './Common.requests';

// Body: Thêm voucher
export interface CreateVoucherRequestBody {
  name?: string;
  description?: string;
  discount: number;
  discount_unit: VoucherDiscountUnit;
  code: string;
}

// Body: Cập nhật voucher
export type UpdateVoucherRequestBody = CreateVoucherRequestBody;

// Query: Lấy danh sách voucher
export interface GetVouchersRequestQuery extends PaginationRequestQuery {
  unit?: VoucherDiscountUnit;
  is_used?: 0 | 1;
}

// Params: Voucher ID
export interface VoucherIdRequestParams extends ParamsDictionary {
  voucher_id: string;
}

// Body: Xóa voucher (có thể xóa nhiều voucher cùng lúc)
export interface DeleteVouchersRequestBody {
  voucher_ids: string[];
}

// Params: Voucher code
export interface VoucherCodeRequestParams extends ParamsDictionary {
  voucher_code: string;
}

// Body: Áp dụng voucher
export interface ApplyVoucherRequestBody {
  voucher_code: string;
  original_price: number;
}
