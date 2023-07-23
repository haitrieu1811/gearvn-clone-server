import fs from 'fs';
import { ObjectId } from 'mongodb';
import path from 'path';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';

import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
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
  // Lấy danh sách nhãn hiệu
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

  // Thêm hình ảnh sản phẩm
  async addImage({ images, product_id }: { images: string[]; product_id: string }) {
    const dataInsert = images.map((image) => {
      return new Media({
        name: image,
        type: MediaType.Image
      });
    });
    const { insertedIds } = await databaseService.medias.insertMany(dataInsert);
    await databaseService.products.findOneAndUpdate(
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
      }
    );
    return {
      message: PRODUCTS_MESSAGES.ADD_IMAGE_SUCCEED
    };
  }

  // Xóa hình ảnh sản phẩm
  async deleteImage(media_id: string) {
    const [image] = await Promise.all([
      databaseService.medias.findOne({ _id: new ObjectId(media_id) }),
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
    if (image) {
      const imagePath = path.resolve(UPLOAD_IMAGE_DIR, image.name);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    return {
      message: PRODUCTS_MESSAGES.DELETE_IMAGE_SUCCEED
    };
  }

  // Tạo sản phẩm mới
  async createProduct({ payload, user_id }: { payload: CreateProductRequestBody; user_id: string }) {
    const { insertedId } = await databaseService.products.insertOne(
      new Product({
        ...payload,
        brand_id: new ObjectId(payload.brand_id),
        category_id: new ObjectId(payload.category_id),
        user_id: new ObjectId(user_id)
      })
    );
    return {
      message: PRODUCTS_MESSAGES.CREATE_PRODUCT_SUCCEED,
      data: {
        insertedId
      }
    };
  }

  // Cập nhật sản phẩm cũ
  async updateProduct({ payload, product_id }: { payload: UpdateProductRequestBody; product_id: string }) {
    const { value } = await databaseService.products.findOneAndUpdate(
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
    if (value) {
      if (value.thumbnail !== payload.thumbnail) {
        const thumbnailPath = path.resolve(UPLOAD_IMAGE_DIR, value.thumbnail);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
    }
    return {
      message: PRODUCTS_MESSAGES.UPDATE_PRODUCT_SUCCEED
    };
  }

  // Xóa sản phẩm
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

  // Lấy danh sách các sản phẩm
  async getListProduct(query: GetProductListRequestQuery) {
    const { page, limit, category, brand, sortBy, orderBy } = query;
    // Sắp xếp
    const _sortBy = sortBy ? sortBy : 'created_at';
    const _orderBy = orderBy === 'desc' ? -1 : 1;
    const sort = {
      [_sortBy]: _orderBy
    };
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const skip = (_page - 1) * _limit;
    // Lọc
    const categoryArray = category ? category.split('-') : [];
    const brandArray = brand ? brand.split('-') : [];
    const queryConfig = omitBy(
      {
        category_id: category
          ? {
              $in: categoryArray.map((category) => new ObjectId(category))
            }
          : undefined,
        brand_id: brand
          ? {
              $in: brandArray.map((brand) => new ObjectId(brand))
            }
          : undefined
      },
      isUndefined
    );
    // Truy vấn
    const [total, products] = await Promise.all([
      databaseService.products.countDocuments({
        ...queryConfig
      }),
      databaseService.products
        .aggregate([
          {
            $match: {
              ...queryConfig
            }
          },
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
            $lookup: {
              from: 'medias',
              localField: 'images',
              foreignField: '_id',
              as: 'images'
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
              _id: 1,
              name_vi: 1,
              name_en: 1,
              thumbnail: 1,
              price: 1,
              price_after_discount: 1,
              category: 1,
              brand: 1,
              created_at: 1,
              updated_at: 1
            }
          },
          {
            $sort: sort
          }
        ])
        .skip(skip)
        .limit(_limit)
        .toArray()
    ]);
    // Số lượng trang
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

  // Lấy thông tin chi tiết của sản phẩm
  async getProductDetail(product_id: string) {
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
            _id: 1,
            name_vi: 1,
            name_en: 1,
            thumbnail: 1,
            images: 1,
            price: 1,
            price_after_discount: 1,
            general_info: 1,
            description: 1,
            category_id: 1,
            brand_id: 1,
            specifications: 1,
            created_at: 1,
            updated_at: 1
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
