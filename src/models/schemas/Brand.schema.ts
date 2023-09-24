import { ObjectId } from 'mongodb';

interface BrandType {
  _id?: ObjectId;
  name: string;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

class Brand {
  _id?: ObjectId;
  name: string;
  user_id: ObjectId;
  created_at: Date;
  updated_at: Date;

  constructor({ _id, name, user_id, created_at, updated_at }: BrandType) {
    const date = new Date();
    this._id = _id;
    this.name = name;
    this.user_id = user_id;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Brand;
