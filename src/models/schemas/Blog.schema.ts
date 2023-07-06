import { ObjectId } from 'mongodb';
import { BlogStatus } from '~/constants/enum';

interface BlogInterface {
  _id?: ObjectId;
  thumbnail: string;
  name_vi: string;
  name_en?: string;
  content_vi: string;
  content_en?: string;
  status?: BlogStatus;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

class Blog {
  _id?: ObjectId;
  thumbnail: string;
  name_vi: string;
  name_en: string;
  content_vi: string;
  content_en: string;
  status: BlogStatus;
  user_id: ObjectId;
  created_at: Date;
  updated_at: Date;

  constructor(blog: BlogInterface) {
    const date = new Date();

    this._id = blog._id;
    this.thumbnail = blog.thumbnail;
    this.name_vi = blog.name_vi;
    this.name_en = blog.name_en || '';
    this.content_vi = blog.content_vi;
    this.content_en = blog.content_en || '';
    this.status = blog.status || BlogStatus.Pending;
    this.user_id = blog.user_id;
    this.created_at = blog.created_at || date;
    this.updated_at = blog.updated_at || date;
  }
}

export default Blog;
