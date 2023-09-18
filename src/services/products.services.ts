import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';
import omit from 'lodash/omit';
import { ObjectId } from 'mongodb';

import { MediaType } from '~/constants/enum';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import {
  CreateProductRequestBody,
  GetProductListRequestQuery,
  UpdateProductRequestBody
} from '~/models/requests/Product.requests';
import Media from '~/models/schemas/Media.schema';
import Product from '~/models/schemas/Product.schema';
import databaseService from './database.services';

class ProductService {
  // Tạo sản phẩm mới
  async createProduct({ payload, user_id }: { payload: CreateProductRequestBody; user_id: string }) {
    const { images, brand_id, category_id } = payload;
    let insertedIds: ObjectId[] = [];
    if (images && images.length > 0) {
      const _images = images.map((image) => new Media({ name: image, type: MediaType.Image }));
      const { insertedIds: _insertedIds } = await databaseService.medias.insertMany(_images);
      insertedIds = Object.values(_insertedIds);
    }
    await databaseService.products.insertOne(
      new Product({
        ...payload,
        brand_id: new ObjectId(brand_id),
        category_id: new ObjectId(category_id),
        user_id: new ObjectId(user_id),
        images: insertedIds
      })
    );
    return {
      message: PRODUCTS_MESSAGES.CREATE_PRODUCT_SUCCEED
    };
  }

  // Cập nhật sản phẩm cũ
  async updateProduct({ payload, product_id }: { payload: UpdateProductRequestBody; product_id: string }) {
    const { images, category_id, brand_id } = payload;
    const _payload = omit(payload, ['images']);
    let insertedIds: ObjectId[] = [];
    if (images && images.length > 0) {
      const _image = images.map((image) => new Media({ name: image, type: MediaType.Image }));
      const { insertedIds: _insertedIds } = await databaseService.medias.insertMany(_image);
      insertedIds = Object.values(_insertedIds);
    }
    await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
      {
        $set: {
          ..._payload,
          category_id: category_id ? new ObjectId(category_id) : undefined,
          brand_id: brand_id ? new ObjectId(brand_id) : undefined
        },
        $push: {
          images: {
            $each: insertedIds
          }
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
    // Lấy thông tin truy vấn
    const { page, limit, category, brand, name, sortBy, orderBy } = query;
    // Sắp xếp
    const _sortBy = sortBy ? sortBy : 'updated_at';
    const _orderBy = orderBy ? (orderBy === 'desc' ? -1 : 1) : -1;
    const sort = {
      [_sortBy]: _orderBy
    };
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const skip = (_page - 1) * _limit;
    // Tìm kiếm
    const categoryArray = category ? category.split('-') : [];
    const brandArray = brand ? brand.split('-') : [];
    const text = name ? { $text: { $search: name } } : {};
    const match = omitBy(
      {
        ...text,
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
    // Lấy danh sách sản phẩm
    const [total, products] = await Promise.all([
      databaseService.products.countDocuments(match),
      databaseService.products
        .aggregate([
          {
            $match: match
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
            $sort: sort
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
            _id: new ObjectId(product_id)
          }
        },
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
            from: 'medias',
            localField: 'images',
            foreignField: '_id',
            as: 'images'
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
          $unwind: {
            path: '$brand'
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
          $unwind: {
            path: '$category'
          }
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'product_id',
            as: 'product_reviews'
          }
        },
        {
          $addFields: {
            product_reviews: {
              $filter: {
                input: '$product_reviews',
                as: 'item',
                cond: {
                  $eq: ['$$item.parent_id', null]
                }
              }
            },
            five_star: {
              $filter: {
                input: '$product_reviews',
                as: 'item',
                cond: {
                  $eq: ['$$item.rating', 5]
                }
              }
            },
            four_star: {
              $filter: {
                input: '$product_reviews',
                as: 'item',
                cond: {
                  $eq: ['$$item.rating', 4]
                }
              }
            },
            three_star: {
              $filter: {
                input: '$product_reviews',
                as: 'item',
                cond: {
                  $eq: ['$$item.rating', 3]
                }
              }
            },
            two_star: {
              $filter: {
                input: '$product_reviews',
                as: 'item',
                cond: {
                  $eq: ['$$item.rating', 2]
                }
              }
            },
            one_star: {
              $filter: {
                input: '$product_reviews',
                as: 'item',
                cond: {
                  $eq: ['$$item.rating', 1]
                }
              }
            }
          }
        },
        {
          $addFields: {
            rating_score: {
              $avg: '$product_reviews.rating'
            },
            rating_count: {
              $size: '$product_reviews'
            },
            rating_five_count: {
              $size: '$five_star'
            },
            rating_four_count: {
              $size: '$four_star'
            },
            rating_three_count: {
              $size: '$three_star'
            },
            rating_two_count: {
              $size: '$two_star'
            },
            rating_one_count: {
              $size: '$one_star'
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
            thumbnail: {
              $first: '$thumbnail'
            },
            price: {
              $first: '$price'
            },
            price_after_discount: {
              $first: '$price_after_discount'
            },
            available_count: {
              $first: '$available_count'
            },
            rating_score: {
              $first: '$rating_score'
            },
            rating_count: {
              $first: '$rating_count'
            },
            rating_five_count: {
              $first: '$rating_five_count'
            },
            rating_four_count: {
              $first: '$rating_four_count'
            },
            rating_three_count: {
              $first: '$rating_three_count'
            },
            rating_two_count: {
              $first: '$rating_two_count'
            },
            rating_one_count: {
              $first: '$rating_one_count'
            },
            general_info: {
              $first: '$general_info'
            },
            description: {
              $first: '$description'
            },
            author: {
              $first: '$author'
            },
            brand: {
              $first: '$brand'
            },
            category: {
              $first: '$category'
            },
            images: {
              $first: '$images'
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
            'author.status': 0,
            'author.password': 0,
            'author.role': 0,
            'author.gender': 0,
            'author.verify': 0,
            'author.phoneNumber': 0,
            'author.addresses': 0,
            'author.date_of_birth': 0,
            'author.email_verify_token': 0,
            'author.forgot_password_token': 0,
            'author.created_at': 0,
            'author.updated_at': 0,
            'images.type': 0
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
