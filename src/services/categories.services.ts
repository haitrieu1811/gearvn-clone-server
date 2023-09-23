import { ObjectId } from 'mongodb';

import { CATEGORIES_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Category, { CategoryType } from '~/models/schemas/Category.schema';
import databaseService from './database.services';

class CategoryService {
  // Lấy danh sách danh mục
  async getCategories(query: PaginationRequestQuery) {
    const { page, limit } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 1000;
    const [total, categories] = await Promise.all([
      databaseService.categories.countDocuments(),
      databaseService.categories
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
              foreignField: 'category_id',
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
              name_vi: {
                $first: '$name_vi'
              },
              name_en: {
                $first: '$name_en'
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
      message: CATEGORIES_MESSAGES.GET_LIST_SUCCEED,
      data: {
        categories,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }

  // Lấy thông tin chi tiết 1 danh mục
  async getCategory(category_id: string) {
    const category = await databaseService.categories.findOne({ _id: new ObjectId(category_id) });
    return {
      message: CATEGORIES_MESSAGES.GET_CATEGORY_SUCCEED,
      data: {
        category
      }
    };
  }

  // Tạo mới danh mục
  async createCategory(payload: CategoryType) {
    await databaseService.categories.insertOne(new Category(payload));
    return {
      message: CATEGORIES_MESSAGES.CREATE_SUCCEED
    };
  }

  // Cập nhật danh mục
  async updateCategory({ payload, category_id }: { payload: CategoryType; category_id: string }) {
    const result = await databaseService.categories.findOneAndUpdate(
      {
        _id: new ObjectId(category_id)
      },
      {
        $set: payload,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    );
    return {
      message: CATEGORIES_MESSAGES.UPDATE_SUCCEED,
      data: {
        category: result.value
      }
    };
  }

  // Xóa danh mục
  async deleteCategory(category_ids: ObjectId[]) {
    const _category_ids = category_ids.map((id) => new ObjectId(id));
    const { deletedCount } = await databaseService.categories.deleteMany({
      _id: {
        $in: _category_ids
      }
    });
    return {
      message: `Xóa ${deletedCount} danh mục thành công`
    };
  }
}

const categoryService = new CategoryService();
export default categoryService;
