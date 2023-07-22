import { ObjectId } from 'mongodb';

import { BLOGS_MESSAGES } from '~/constants/messages';
import { CreateBlogRequestBody, GetBlogListRequestQuery, UpdateBlogRequestBody } from '~/models/requests/Blog.requests';
import Blog from '~/models/schemas/Blog.schema';
import databaseService from './database.services';

class BlogService {
  async create({ payload, user_id }: { payload: CreateBlogRequestBody; user_id: string }) {
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

  async update({ payload, blog_id }: { payload: UpdateBlogRequestBody; blog_id: string }) {
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

  async delete(blog_ids: string[]) {
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

  async getList(query: GetBlogListRequestQuery) {
    const { page, limit } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const skip = (_page - 1) * _limit;
    const [blogs, total] = await Promise.all([
      databaseService.blogs
        .find(
          {},
          {
            projection: {
              status: 0,
              user_id: 0
            }
          }
        )
        .skip(skip)
        .limit(_limit)
        .sort({
          created_at: -1
        })
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

  async getDetail(blog_id: string) {
    const blog = await databaseService.blogs.findOne({ _id: new ObjectId(blog_id) });
    return {
      message: BLOGS_MESSAGES.GET_BLOG_DETAIL_SUCCEED,
      data: {
        blog
      }
    };
  }
}

const blogService = new BlogService();
export default blogService;
