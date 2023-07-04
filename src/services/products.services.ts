import { ObjectId } from 'mongodb';

import { PRODUCTS_LIST_PROJECTION } from '~/constants/db';
import { MediaType } from '~/constants/enum';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import {
  CreateProductRequestBody,
  GetProductListRequestQuery,
  UpdateProductRequestBody
} from '~/models/requests/Product.requests';
import Brand from '~/models/schemas/Brand.schema';
import Media from '~/models/schemas/Media.schema';
import Product from '~/models/schemas/Product.schema';
import databaseService from './database.services';

class ProductService {
  async createBrand(name: string) {
    await databaseService.brands.insertOne(new Brand({ name }));
    return {
      message: PRODUCTS_MESSAGES.CREATE_BRAND_SUCCEED
    };
  }

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

  async deleteBrand(brand_id: string) {
    await databaseService.brands.deleteOne({ _id: new ObjectId(brand_id) });
    return {
      message: PRODUCTS_MESSAGES.DELETE_BRAND_SUCCEED
    };
  }

  async addImage({ images, product_id }: { images: string[]; product_id: string }) {
    const dataInsert = images.map((image) => {
      return new Media({
        name: image,
        type: MediaType.Image
      });
    });
    const { insertedIds } = await databaseService.medias.insertMany(dataInsert);
    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $push: {
          images: {
            $each: Object.values(insertedIds)
          }
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    );
    return {
      message: PRODUCTS_MESSAGES.ADD_IMAGE_SUCCEED,
      data: {
        insertedIds: Object.values(insertedIds),
        product: product.value
      }
    };
  }

  async deleteImage(media_id: string) {
    await Promise.all([
      databaseService.medias.deleteOne({ _id: new ObjectId(media_id) }),
      databaseService.products.updateOne(
        {
          images: {
            $elemMatch: {
              $eq: new ObjectId(media_id)
            }
          }
        },
        {
          $pull: {
            images: new ObjectId(media_id)
          }
        }
      )
    ]);
    return {
      message: PRODUCTS_MESSAGES.DELETE_IMAGE_SUCCEED
    };
  }

  async createProduct({ payload, user_id }: { payload: CreateProductRequestBody; user_id: string }) {
    const { insertedId } = await databaseService.products.insertOne(
      new Product({ ...payload, user_id: new ObjectId(user_id) })
    );
    const product = await databaseService.products.findOne({ _id: new ObjectId(insertedId) });
    return {
      message: PRODUCTS_MESSAGES.CREATE_PRODUCT_SUCCEED,
      data: {
        product
      }
    };
  }

  async updateProduct({ payload, product_id }: { payload: UpdateProductRequestBody; product_id: string }) {
    const result = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          ...payload
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    );
    return {
      message: PRODUCTS_MESSAGES.UPDATE_PRODUCT_SUCCEED,
      data: {
        product: result.value
      }
    };
  }

  async deleteProduct(product_id: string) {
    await databaseService.products.deleteOne({ _id: new ObjectId(product_id) });
    return {
      message: PRODUCTS_MESSAGES.DELETE_PRODUCT_SUCCEED
    };
  }

  async getListProduct(query: GetProductListRequestQuery) {
    const total = await databaseService.products.countDocuments();
    const limit = Number(query.limit) || 2;
    const pageSize = Math.ceil(total / limit);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    const products = await databaseService.products
      .find({}, { projection: PRODUCTS_LIST_PROJECTION })
      .skip(skip)
      .limit(limit)
      .toArray();
    return {
      message: PRODUCTS_MESSAGES.GET_PRODUCT_LIST_SUCCEED,
      data: {
        products,
        pagination: {
          page,
          limit,
          page_size: pageSize
        }
      }
    };
  }

  async getProductDetail(product_id: string) {
    // const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) });
    const product = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: { $eq: new ObjectId(product_id) }
          }
        },
        {
          $lookup: {
            from: 'medias',
            localField: 'images',
            foreignField: '_id',
            as: 'images'
          }
        },
        {
          $project: {
            'images._id': 0,
            'images.type': 0,
            'images.created_at': 0,
            'images.updated_at': 0
          }
        }
      ])
      .toArray();
    return {
      message: PRODUCTS_MESSAGES.GET_PRODUCT_DETAIL_SUCCEED,
      data: {
        product
      }
    };
  }
}

const productService = new ProductService();
export default productService;
