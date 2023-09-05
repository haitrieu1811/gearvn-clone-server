import { ObjectId } from 'mongodb';

import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { GetBrandsRequestQuery } from '~/models/requests/Brand.requests';
import Brand from '~/models/schemas/Brand.schema';
import databaseService from './database.services';

class BrandsService {
  // Lấy danh sách nhãn hiệu
  async getBrands(query: GetBrandsRequestQuery) {
    const { limit, page } = query;
    const _limit = Number(limit) || 0;
    const _page = Number(page) || 1;
    const skip = (_page - 1) * _limit;
    const [total, brands] = await Promise.all([
      await databaseService.brands.countDocuments(),
      await databaseService.brands.find({}).skip(skip).limit(_limit).toArray()
    ]);
    const pageSize = Math.ceil(total / _limit);
    return {
      message: PRODUCTS_MESSAGES.GET_BRANDS_SUCCEED,
      data: {
        brands,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: pageSize
        }
      }
    };
  }

  // Lấy thông tin chi tiết một nhãn hiệu
  async getBrand(brand_id: string) {
    const brand = await databaseService.brands.findOne({ _id: new ObjectId(brand_id) });
    return {
      message: PRODUCTS_MESSAGES.GET_BRAND_SUCCEED,
      data: {
        brand
      }
    };
  }

  // Tạo nhãn hiệu mới
  async createBrand(name: string) {
    await databaseService.brands.insertOne(new Brand({ name }));
    return {
      message: PRODUCTS_MESSAGES.CREATE_BRAND_SUCCEED
    };
  }

  // Cập nhật nhãn hiệu
  async updateBrand({ name, brand_id }: { name: string; brand_id: string }) {
    await databaseService.brands.updateOne(
      { _id: new ObjectId(brand_id) },
      {
        $set: {
          name
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: PRODUCTS_MESSAGES.UPDATE_BRAND_SUCCEED
    };
  }

  // Xóa nhãn hiệu
  async deleteBrand(brand_ids: ObjectId[]) {
    const _brand_ids = brand_ids.map((id) => new ObjectId(id));

    const [{ deletedCount }] = await Promise.all([
      databaseService.brands.deleteMany({
        _id: {
          $in: _brand_ids
        }
      }),
      databaseService.products.deleteMany({
        brand_id: {
          $in: _brand_ids
        }
      })
    ]);

    return {
      message: `Delete ${deletedCount} brand succeed`
    };
  }
}

const brandsService = new BrandsService();
export default brandsService;
