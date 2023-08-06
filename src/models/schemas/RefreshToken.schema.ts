import { ObjectId } from 'mongodb';

interface RefreshTokenType {
  _id?: ObjectId;
  token: string;
  user_id: ObjectId;
  created_at?: Date;
  iat: number;
  exp: number;
}

class RefreshToken {
  _id?: ObjectId;
  token: string;
  created_at: Date;
  user_id: ObjectId;
  iat: Date;
  exp: Date;

  constructor(refreshToken: RefreshTokenType) {
    this._id = refreshToken._id;
    this.token = refreshToken.token;
    this.user_id = refreshToken.user_id;
    this.created_at = new Date();
    this.iat = new Date(refreshToken.iat * 1000);
    this.exp = new Date(refreshToken.exp * 1000);
  }
}

export default RefreshToken;
