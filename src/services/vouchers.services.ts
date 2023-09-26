import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';
import { ObjectId } from 'mongodb';

import { VOUCHERS_MESSAGES } from '~/constants/messages';
import {
  CreateVoucherRequestBody,
  GetVouchersRequestQuery,
  UpdateVoucherRequestBody
} from '~/models/requests/Voucher.requests';
import Voucher from '~/models/schemas/Voucher.schema';
import databaseService from './database.services';
import { VoucherDiscountUnit } from '~/constants/enum';

class VouchersService {
  // Thêm voucher
  async createVoucher({ body, user_id }: { body: CreateVoucherRequestBody; user_id: string }) {
    await databaseService.vouchers.insertOne(
      new Voucher({
        ...body,
        user_id: new ObjectId(user_id)
      })
    );
    return {
      message: VOUCHERS_MESSAGES.CREATE_VOUCHER_SUCCEDD
    };
  }

  // Lấy danh sách voucher
  async getVouchers(query: GetVouchersRequestQuery) {
    const { page, limit, unit } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 20;
    const match = omitBy(
      {
        discount_unit: Number(unit) || undefined
      },
      isUndefined
    );
    const [vouchers, total] = await Promise.all([
      databaseService.vouchers
        .find(match, { projection: { user_id: 0 } })
        .sort({
          created_at: -1
        })
        .skip((_page - 1) * _limit)
        .limit(_limit)
        .toArray(),
      databaseService.vouchers.countDocuments(match)
    ]);
    return {
      message: VOUCHERS_MESSAGES.GET_VOUCHERS_SUCCEDD,
      data: {
        vouchers,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }

  // Lấy 1 voucher theo voucher_code hoặc voucher_id
  async getVoucher({ voucher_code, voucher_id }: { voucher_code?: string; voucher_id?: string }) {
    const match = omitBy(
      {
        code: voucher_code,
        _id: voucher_id ? new ObjectId(voucher_id) : undefined
      },
      isUndefined
    );
    const voucher = await databaseService.vouchers.findOne(match, { projection: { user_id: 0 } });
    return {
      message: VOUCHERS_MESSAGES.GET_VOUCHER_SUCCEDD,
      data: {
        voucher
      }
    };
  }

  // Cập nhật voucher
  async updateVoucher({ voucher_id, body }: { voucher_id: string; body: UpdateVoucherRequestBody }) {
    await databaseService.vouchers.updateOne(
      {
        _id: new ObjectId(voucher_id)
      },
      {
        $set: body,
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: VOUCHERS_MESSAGES.UPDATE_VOUCHER_SUCCEDD
    };
  }

  // Xóa vouchers (có thể xóa nhiều voucher cùng lúc)
  async deleteVouchers(voucher_ids: string[]) {
    const _voucher_ids = voucher_ids.map((id) => new ObjectId(id));
    const { deletedCount } = await databaseService.vouchers.deleteMany({
      _id: {
        $in: _voucher_ids
      }
    });
    return {
      message: `Đã xóa ${deletedCount} voucher thành công`
    };
  }

  // Áp dụng voucher
  async applyVoucher({ voucher_code, original_price }: { voucher_code: string; original_price: number }) {
    const voucher = await databaseService.vouchers.findOne(
      {
        code: voucher_code,
        is_used: false
      },
      {
        projection: {
          user_id: 0
        }
      }
    );
    const { discount_unit, discount } = voucher as Voucher;
    const total_reduced =
      discount_unit === VoucherDiscountUnit.Percentage ? original_price * (discount / 100) : discount;
    return {
      message: VOUCHERS_MESSAGES.APPLY_VOUCHER_SUCCEDD,
      data: {
        total_reduced,
        voucher
      }
    };
  }

  // Sử dụng voucher
  async useVoucher(voucher_code: string) {
    const { value: voucher } = await databaseService.vouchers.findOneAndUpdate(
      {
        code: voucher_code
      },
      {
        $set: {
          is_used: true
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_id: 0
        }
      }
    );
    return {
      message: VOUCHERS_MESSAGES.USE_VOUCHER_SUCCEDD,
      data: {
        voucher
      }
    };
  }
}

const vouchersService = new VouchersService();
export default vouchersService;
