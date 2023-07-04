import { ObjectId } from 'mongodb';
import { MediaType } from '~/constants/enum';

export interface MediaInterface {
  _id?: ObjectId;
  name: string;
  type: MediaType;
  created_at?: Date;
  updated_at?: Date;
}

class Media {
  _id?: ObjectId;
  name: string;
  type: MediaType;
  created_at: Date;
  updated_at: Date;

  constructor(media: MediaInterface) {
    const date = new Date();

    this._id = media._id;
    this.name = media.name;
    this.type = media.type;
    this.created_at = date;
    this.updated_at = date;
  }
}

export default Media;
