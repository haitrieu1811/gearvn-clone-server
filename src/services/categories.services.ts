import { ObjectId } from 'mongodb';

import { CATEGORIES_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Category, { CategoryType } from '~/models/schemas/Category.schema';
import databaseService from './database.services';

class CategoryService {
  // Lấy danh sách danh mục
  async getCategories(query: PaginationRequestQuery) {
    const { page, limit } = query;
    const _limit = Number(limit) || 0;
    const _page = Number(page) || 1;
    const [total, categories] = await Promise.all([
      databaseService.categories.countDocuments(),
      databaseService.categories
        .find({})
        .skip((_page - 1) * _limit)
        .limit(_limit)
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
          page_size: _limit ? Math.ceil(total / _limit) : 1
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
