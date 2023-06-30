import { ObjectId } from 'mongodb';

interface RefreshTokenType {
  _id?: ObjectId;
  token: string;
  user_id: ObjectId;
  created_at?: Date;
}

class RefreshToken {
  _id?: ObjectId;
  token: string;
  created_at: Date;
  user_id: ObjectId;

  constructor(refreshToken: RefreshTokenType) {
    this._id = refreshToken._id;
    this.token = refreshToken.token;
    this.user_id = refreshToken.user_id;
    this.created_at = new Date();
  }
}

export default RefreshToken;
