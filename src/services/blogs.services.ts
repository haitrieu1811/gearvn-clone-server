import { ObjectId } from 'mongodb';

import { BLOGS_MESSAGES } from '~/constants/messages';
import { CreateBlogRequestBody, UpdateBlogRequestBody } from '~/models/requests/Blog.requests';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Blog from '~/models/schemas/Blog.schema';
import databaseService from './database.services';

class BlogService {
  // Tạo blog
  async createBlog({ payload, user_id }: { payload: CreateBlogRequestBody; user_id: string }) {
    await databaseService.blogs.insertOne(
      new Blog({
        ...payload,
        user_id: new ObjectId(user_id)
      })
    );
    return {
      message: BLOGS_MESSAGES.CREATE_BLOG_SUCCEED
    };
  }

  // Cập nhật blog
  async updateBlog({ payload, blog_id }: { payload: UpdateBlogRequestBody; blog_id: string }) {
    await databaseService.blogs.findOneAndUpdate(
      {
        _id: new ObjectId(blog_id)
      },
      {
        $set: {
          ...payload
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: BLOGS_MESSAGES.UPDATE_BLOG_SUCCEED
    };
  }

  // Xóa blog
  async deleteBlogs(blog_ids: string[]) {
    const _blog_ids = blog_ids.map((id) => new ObjectId(id));
    const { deletedCount } = await databaseService.blogs.deleteMany({
      _id: {
        $in: _blog_ids
      }
    });
    return {
      message: `Delete ${deletedCount} blog succeed`
    };
  }

  // Lấy danh sách blog
  async getBlogs(query: PaginationRequestQuery) {
    const { page, limit } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const [blogs, total] = await Promise.all([
      databaseService.blogs
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
            $group: {
              _id: '$_id',
              thumbnail: {
                $first: '$thumbnail'
              },
              name_vi: {
                $first: '$name_vi'
              },
              name_en: {
                $first: '$name_en'
              },
              content_vi: {
                $first: '$content_vi'
              },
              content_en: {
                $first: '$content_en'
              },
              status: {
                $first: '$status'
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
              'author.email_verify_token': 0,
              'author.forgot_password_token': 0,
              'author.addresses': 0
            }
          },
          {
            $sort: {
              created_at: -1
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
      databaseService.blogs.countDocuments()
    ]);
    const pageSize = Math.ceil(total / _limit);
    return {
      message: BLOGS_MESSAGES.GET_BLOG_LIST_SUCCEED,
      data: {
        blogs,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: pageSize
        }
      }
    };
  }

  // Lấy chi tiết blog
  async getBlog(blog_id: string) {
    const blog = await databaseService.blogs
      .aggregate([
        {
          $match: {
            _id: new ObjectId(blog_id)
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
          $group: {
            _id: '$_id',
            thumbnail: {
              $first: '$thumbnail'
            },
            name_vi: {
              $first: '$name_vi'
            },
            name_en: {
              $first: '$name_en'
            },
            content_vi: {
              $first: '$content_vi'
            },
            content_en: {
              $first: '$content_en'
            },
            status: {
              $first: '$status'
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
            'author.email_verify_token': 0,
            'author.forgot_password_token': 0,
            'author.addresses': 0
          }
        }
      ])
      .toArray();
    return {
      message: BLOGS_MESSAGES.GET_BLOG_DETAIL_SUCCEED,
      data: {
        blog: blog[0]
      }
    };
  }
}

const blogService = new BlogService();
export default blogService;
