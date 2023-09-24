import { ObjectId } from 'mongodb';

import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Brand from '~/models/schemas/Brand.schema';
import databaseService from './database.services';

class BrandsService {
  // Lấy danh sách nhãn hiệu
  async getBrands(query: PaginationRequestQuery) {
    const { limit, page } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 1000;
    const [total, brands] = await Promise.all([
      await databaseService.brands.countDocuments(),
      await databaseService.brands
        .aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: 'brand_id',
              as: 'product_count'
            }
          },
          {
            $addFields: {
              product_count: {
                $size: '$product_count'
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              name: {
                $first: '$name'
              },
              product_count: {
                $first: '$product_count'
              },
              author: {
                $first: '$author'
              },
              created_at: {
                $first: '$created_at'
              },
              updated_at: {
                $first: '$updated_at'
              }
            }
          },
          {
            $project: {
              'author.password': 0,
              'author.addresses': 0,
              'author.email_verify_token': 0,
              'author.forgot_password_token': 0
            }
          },
          {
            $sort: {
              updated_at: -1
            }
          },
          {
            $skip: (_page - 1) * _limit
          },
          {
            $limit: _limit
          }
        ])
        .toArray()
    ]);
    return {
      message: PRODUCTS_MESSAGES.GET_BRANDS_SUCCEED,
      data: {
        brands,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: Math.ceil(total / _limit)
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
  async createBrand({ name, user_id }: { name: string; user_id: string }) {
    await databaseService.brands.insertOne(new Brand({ name, user_id: new ObjectId(user_id) }));
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
