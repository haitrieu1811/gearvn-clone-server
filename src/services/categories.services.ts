import { ObjectId } from 'mongodb';

import { CATEGORIES_MESSAGES } from '~/constants/messages';
import { GetCategoriesRequestQuery } from '~/models/requests/Category.requests';
import Category, { CategoryType } from '~/models/schemas/Category.schema';
import databaseService from './database.services';

class CategoryService {
  async getList(query: GetCategoriesRequestQuery) {
    const total = await databaseService.categories.countDocuments();
    const limit = Number(query.limit) || 10;
    const pageSize = Math.ceil(total / limit);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    const categories = await databaseService.categories.find({}).skip(skip).limit(limit).toArray();
    return {
      message: CATEGORIES_MESSAGES.GET_LIST_SUCCEED,
      data: {
        categories,
        pagination: {
          total,
          page,
          limit,
          page_size: pageSize
        }
      }
    };
  }

  async getOne(category_id: string) {
    const category = await databaseService.categories.findOne({ _id: new ObjectId(category_id) });
    return {
      message: CATEGORIES_MESSAGES.GET_CATEGORY_SUCCEED,
      data: {
        category
      }
    };
  }

  async create(payload: CategoryType) {
    await databaseService.categories.insertOne(new Category(payload));
    return {
      message: CATEGORIES_MESSAGES.CREATE_SUCCEED
    };
  }

  async update({ payload, category_id }: { payload: CategoryType; category_id: string }) {
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

  async delete(category_id: string) {
    await databaseService.categories.deleteOne({ _id: new ObjectId(category_id) });
    return {
      message: CATEGORIES_MESSAGES.DELETE_SUCCEED
    };
  }
}

const categoryService = new CategoryService();
export default categoryService;
