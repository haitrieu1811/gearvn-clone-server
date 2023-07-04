import { ObjectId } from 'mongodb';

export interface ImageType {
  _id?: ObjectId;
  url: string;
  created_at?: Date;
  updated_at?: Date;
}

class Image {
  _id?: ObjectId;
  url: string;
  created_at: Date;
  updated_at: Date;

  constructor(image: ImageType) {
    const date = new Date();

    this._id = image._id;
    this.url = image.url;
    this.created_at = date;
    this.updated_at = date;
  }
}

export default Image;
