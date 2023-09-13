import { ObjectId } from 'mongodb';

import { MediaType } from '~/constants/enum';
import { PRODUCTS_MESSAGES } from '~/constants/messages';
import { AddReviewRequestBody } from '~/models/requests/ProductReview.requests';
import Media from '~/models/schemas/Media.schema';
import databaseService from './database.services';
import ProductReview from '~/models/schemas/ProductReview.schema';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import mediaService from './medias.services';

class ProductReviewsService {
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
            $match
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
            $unwind: {
              path: '$replies',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'replies.user_id',
              foreignField: '_id',
              as: 'reply_users'
            }
          },
          {
            $addFields: {
              'replies.author': {
                $filter: {
                  input: '$reply_users',
                  as: 'item',
                  cond: {
                    $eq: ['$$item._id', '$replies.user_id']
                  }
                }
              }
            }
          },
          {
            $unwind: {
              path: '$replies.author',
              preserveNullAndEmptyArrays: true
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
              replies: {
                $push: '$replies'
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
              'replies.rating': 0,
              'replies.author.password': 0,
              'replies.author.status': 0,
              'replies.author.role': 0,
              'replies.author.verify': 0,
              'replies.author.addresses': 0,
              'replies.author.email_verify_token': 0,
              'replies.author.forgot_password_token': 0,
              'replies.author.created_at': 0,
              'replies.author.updated_at': 0,
              'replies.author.gender': 0,
              'replies.author.phoneNumber': 0,
              'replies.author.date_of_birth': 0
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
            user_id: new ObjectId(user_id),
            parent_id: null
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

const productReviewsService = new ProductReviewsService();
export default productReviewsService;
