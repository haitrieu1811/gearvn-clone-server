import fs from 'fs';
import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';
import { ObjectId } from 'mongodb';
import path from 'path';

import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MediaType } from '~/constants/enum';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import {
  CreateProductRequestBody,
  GetProductListRequestQuery,
  UpdateProductRequestBody
} from '~/models/requests/Product.requests';
import { AddReviewRequestBody } from '~/models/requests/ProductReview.requests';
import Media from '~/models/schemas/Media.schema';
import Product from '~/models/schemas/Product.schema';
import ProductReview from '~/models/schemas/ProductReview.schema';
import databaseService from './database.services';
import mediaService from './medias.services';

class ProductService {
  // Thêm hình ảnh sản phẩm
  async addImage({ images, product_id }: { images: string[]; product_id: string }) {
    const dataInsert = images.map(
      (image) =>
        new Media({
          name: image,
          type: MediaType.Image
        })
    );
    const { insertedIds } = await databaseService.medias.insertMany(dataInsert);
    await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
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
            from: 'product_reviews',
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
            specifications: {
              $first: '$specifications'
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
            'category.created_at': 0,
            'category.updated_at': 0,
            'brand.created_at': 0,
            'brand.updated_at': 0,
            'images.created_at': 0,
            'images.updated_at': 0,
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

  // Thêm đánh giá sản phẩm
  async addReview({ body, product_id, user_id }: { product_id: string; user_id: string; body: AddReviewRequestBody }) {
    const { rating, comment, images = [], parent_id } = body;
    let message: string = PRODUCTS_MESSAGES.ADD_REVIEW_SUCCEED;
    let insertedIds: ObjectId[] = [];
    const _images = images.map(
      (image) =>
        new Media({
          name: image,
          type: MediaType.Image
        })
    );
    const product_review = await databaseService.productReviews.findOne({
      product_id: new ObjectId(product_id),
      user_id: new ObjectId(user_id),
      parent_id: null
    });
    if (images.length > 0) {
      const result = await databaseService.medias.insertMany(_images);
      insertedIds = Object.values(result.insertedIds);
    }
    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    if (product_review && !parent_id) {
      await databaseService.productReviews.updateOne(
        {
          product_id: new ObjectId(product_id),
          user_id: new ObjectId(user_id),
          parent_id: null
        },
        {
          $set: {
            rating: rating,
            comment: comment
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
      message = PRODUCTS_MESSAGES.UPDATE_REVIEW_SUCCEED;
    } else {
      await databaseService.productReviews.insertOne(
        new ProductReview({
          rating,
          comment,
          parent_id,
          images: Object.values(insertedIds),
          product_id,
          user_id
        })
      );
    }
    return {
      message
    };
  }

  // Lấy danh sách đánh giá theo từng sản phẩm
  async getReviews({ page, limit, product_id }: PaginationRequestQuery & { product_id: string }) {
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    // Điều kiện tìm kiếm
    const $match = {
      product_id: new ObjectId(product_id),
      parent_id: null
    };
    const [reviews, total] = await Promise.all([
      databaseService.productReviews
        .aggregate([
          {
            $match: {
              product_id: new ObjectId(product_id),
              parent_id: null
            }
          },
          {
            $lookup: {
              from: 'product_reviews',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'replies'
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
            $lookup: {
              from: 'medias',
              localField: 'images',
              foreignField: '_id',
              as: 'images'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $group: {
              _id: '$_id',
              rating: {
                $first: '$rating'
              },
              comment: {
                $first: '$comment'
              },
              author: {
                $first: '$author'
              },
              images: {
                $first: '$images'
              },
              replies: {
                $first: '$replies'
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
              'images.created_at': 0,
              'images.updated_at': 0,
              'images.type': 0,
              'author.password': 0,
              'author.status': 0,
              'author.role': 0,
              'author.verify': 0,
              'author.addresses': 0,
              'author.email_verify_token': 0,
              'author.forgot_password_token': 0,
              'author.created_at': 0,
              'author.updated_at': 0,
              'author.gender': 0,
              'author.phoneNumber': 0,
              'author.date_of_birth': 0,
              'replies.product_id': 0,
              'replies.user_id': 0,
              'replies.parent_id': 0,
              'replies.rating': 0
            }
          },
          {
            $sort: {
              created_at: 1,
              'replies.created_at': 1
            }
          },
          {
            $skip: (_page - 1) * _limit
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.productReviews.countDocuments($match)
    ]);
    return {
      message: PRODUCTS_MESSAGES.GET_REVIEWS_SUCCEED,
      data: {
        reviews,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }

  // Lấy chi tiết đánh giá
  async getReviewDetail({ product_id, user_id }: { product_id: string; user_id: string }) {
    const review = await databaseService.productReviews
      .aggregate([
        {
          $match: {
            product_id: new ObjectId(product_id),
            user_id: new ObjectId(user_id)
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
          $group: {
            _id: '$_id',
            rating: {
              $first: '$rating'
            },
            comment: {
              $first: '$comment'
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
            'images.type': 0,
            'images.created_at': 0,
            'images.updated_at': 0
          }
        }
      ])
      .toArray();
    return {
      message: PRODUCTS_MESSAGES.GET_REVIEW_DETAIL_SUCCEED,
      data: {
        review: review[0]
      }
    };
  }

  // Xóa một hình ảnh đính kèm trong đánh giá
  async deleteReviewImage(image_id: string) {
    await Promise.all([
      databaseService.medias.deleteOne({
        _id: new ObjectId(image_id)
      }),
      databaseService.productReviews.updateOne(
        {
          images: {
            $elemMatch: {
              $eq: new ObjectId(image_id)
            }
          }
        },
        {
          $pull: {
            images: new ObjectId(image_id)
          }
        }
      )
    ]);
    return {
      message: PRODUCTS_MESSAGES.DELETE_REVIEW_IMAGE_SUCCEED
    };
  }

  // Xóa một đánh giá
  async deleteReview(review_id: string) {
    const [{ value }] = await Promise.all([
      databaseService.productReviews.findOneAndDelete({
        _id: new ObjectId(review_id)
      }),
      databaseService.productReviews.deleteMany({
        parent_id: new ObjectId(review_id)
      })
    ]);
    const images = value?.images || [];
    await mediaService.deleteImages(images);
    return {
      message: PRODUCTS_MESSAGES.DELETE_REVIEW_SUCCEED
    };
  }
}

const productService = new ProductService();
export default productService;
