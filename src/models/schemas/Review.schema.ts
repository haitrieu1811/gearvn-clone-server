import { ObjectId } from 'mongodb';

interface ReviewConstructor {
  _id?: ObjectId;
  product_id: string;
  user_id: string;
  parent_id?: string;
  rating?: number;
  comment?: string;
  images?: ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

class Review {
  _id?: ObjectId;
  product_id: ObjectId;
  user_id: ObjectId;
  parent_id: ObjectId | null;
  rating: number | null;
  comment: string;
  images: ObjectId[];
  created_at: Date;
  updated_at: Date;

  constructor({
    _id,
    product_id,
    user_id,
    parent_id,
    rating,
    comment,
    images,
    created_at,
    updated_at
  }: ReviewConstructor) {
    const date = new Date();
    this._id = _id;
    this.product_id = new ObjectId(product_id);
    this.user_id = new ObjectId(user_id);
    this.parent_id = parent_id ? new ObjectId(parent_id) : null;
    this.rating = rating || null;
    this.comment = comment || '';
    this.images = images ? images.map((image) => new ObjectId(image)) : [];
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Review;
