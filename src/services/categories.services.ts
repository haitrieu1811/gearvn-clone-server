import { CATEGORIES_MESSAGES } from '~/constants/messages';
import Category, { CategoryType } from '~/models/schemas/Category.schema';
import databaseService from './database.services';
import { ObjectId } from 'mongodb';

class CategoryService {
  async getList() {
    const result = databaseService.categories.find({});
    const documents = await result.toArray();
    return {
      message: CATEGORIES_MESSAGES.GET_LIST_SUCCEED,
      data: documents
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
