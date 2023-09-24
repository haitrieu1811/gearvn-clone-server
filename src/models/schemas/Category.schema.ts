import { ObjectId } from 'mongodb';

export interface CategoryType {
  _id?: ObjectId;
  name_vi: string;
  name_en: string;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

class Category {
  _id?: ObjectId;
  name_vi: string;
  name_en: string;
  user_id: ObjectId;
  created_at: Date;
  updated_at: Date;

  constructor({ _id, name_vi, name_en, user_id, created_at, updated_at }: CategoryType) {
    const date = new Date();
    this._id = _id;
    this.name_vi = name_vi;
    this.name_en = name_en;
    this.user_id = user_id;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Category;
