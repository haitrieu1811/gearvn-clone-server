import { ObjectId } from 'mongodb';

import { BLOGS_MESSAGES } from '~/constants/messages';
import { CreateBlogRequestBody, UpdateBlogRequestBody } from '~/models/requests/Blog.requests';
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
    const blog = await databaseService.blogs.findOneAndUpdate(
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
      },
      {
        returnDocument: 'after'
      }
    );
    return {
      message: BLOGS_MESSAGES.UPDATE_BLOG_SUCCEED,
      data: {
        blog: blog.value
      }
    };
  }

  async delete(blog_id: string) {
    await databaseService.blogs.deleteOne({ _id: new ObjectId(blog_id) });
    return {
      message: BLOGS_MESSAGES.DELETE_BLOG_SUCCEED
    };
  }
}

const blogService = new BlogService();
export default blogService;
