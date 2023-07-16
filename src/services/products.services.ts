import { ObjectId } from 'mongodb';

import { MediaType } from '~/constants/enum';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import {
  CreateProductRequestBody,
  GetBrandsRequestQuery,
  GetProductListRequestQuery,
  UpdateProductRequestBody
} from '~/models/requests/Product.requests';
import Brand from '~/models/schemas/Brand.schema';
import Media from '~/models/schemas/Media.schema';
import Product from '~/models/schemas/Product.schema';
import databaseService from './database.services';

class ProductService {
  // Brand
  async getBrands(query: GetBrandsRequestQuery) {
    const { limit, page } = query;
    const _limit = Number(limit) || 10;
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

  async getBrand(brand_id: string) {
    const brand = await databaseService.brands.findOne({ _id: new ObjectId(brand_id) });
    return {
      message: PRODUCTS_MESSAGES.GET_BRAND_SUCCEED,
      data: {
        brand
      }
    };
  }

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

  // Image
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

  // Product
  async createProduct({ payload, user_id }: { payload: CreateProductRequestBody; user_id: string }) {
    await databaseService.products.insertOne(
      new Product({
        ...payload,
        brand_id: new ObjectId(payload.brand_id),
        category_id: new ObjectId(payload.category_id),
        user_id: new ObjectId(user_id)
      })
    );
    return {
      message: PRODUCTS_MESSAGES.CREATE_PRODUCT_SUCCEED
    };
  }

  async updateProduct({ payload, product_id }: { payload: UpdateProductRequestBody; product_id: string }) {
    await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
      {
        $set: {
          ...payload,
          category_id: new ObjectId(payload.category_id),
          brand_id: new ObjectId(payload.brand_id)
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: PRODUCTS_MESSAGES.UPDATE_PRODUCT_SUCCEED
    };
  }

  async deleteProduct(product_ids: ObjectId[]) {
    const _product_ids = product_ids.map((id) => new ObjectId(id));
    const { deletedCount } = await databaseService.products.deleteMany({
      _id: {
        $in: _product_ids
      }
    });
    return {
      message: `Delete ${deletedCount} product succeed`
    };
  }

  async getListProduct(query: GetProductListRequestQuery) {
    const { page, limit } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 2;
    const skip = (_page - 1) * _limit;
    const [total, products] = await Promise.all([
      databaseService.products.countDocuments(),
      databaseService.products
        .aggregate([
          {
            $lookup: {
              from: 'brands',
              localField: 'brand_id',
              foreignField: '_id',
              as: 'brand'
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'category_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: '$brand'
          },
          {
            $unwind: '$category'
          },
          {
            $project: {
              user_id: 0,
              specifications: 0,
              images: 0,
              general_info: 0,
              description: 0,
              category_id: 0,
              brand_id: 0
            }
          }
        ])
        .skip(skip)
        .limit(_limit)
        .toArray()
    ]);
    const pageSize = Math.ceil(total / _limit);
    return {
      message: PRODUCTS_MESSAGES.GET_PRODUCT_LIST_SUCCEED,
      data: {
        products,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: pageSize
        }
      }
    };
  }

  async getProductDetail(product_id: string) {
    const product = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: { $eq: new ObjectId(product_id) }
          }
        }
      ])
      .toArray();
    return {
      message: PRODUCTS_MESSAGES.GET_PRODUCT_DETAIL_SUCCEED,
      data: {
        product: product[0]
      }
    };
  }
}

const productService = new ProductService();
export default productService;
