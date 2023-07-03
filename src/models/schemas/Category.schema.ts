import { ObjectId } from 'mongodb';

export interface CategoryType {
  _id?: ObjectId;
  name_vi: string;
  name_en: string;
  created_at?: Date;
  updated_at?: Date;
}

class Category {
  _id?: ObjectId;
  name_vi: string;
  name_en: string;
  created_at: Date;
  updated_at: Date;

  constructor(category: CategoryType) {
    const date = new Date();

    this._id = category._id;
    this.name_vi = category.name_vi;
    this.name_en = category.name_en;
    this.created_at = category.created_at || date;
    this.updated_at = category.updated_at || date;
  }
}

export default Category;
