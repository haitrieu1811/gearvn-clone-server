import { ObjectId } from 'mongodb';

import { UserType, UserStatus, Gender } from '~/constants/enum';

interface UserInterface {
  _id?: ObjectId;
  email: string;
  password: string;
  fullName: string;

  type?: UserType;
  status?: UserStatus;
  roles?: ObjectId[] | [];

  avatar?: string;
  gender?: Gender;
  phoneNumber?: string;
  address?: ObjectId[] | []; // Address
  date_of_birth?: Date;
  email_verify_token?: string;
  forgot_password_verify_token?: string;
  created_at?: Date;
  updated_at?: Date;
}

class User {
  _id?: ObjectId;
  email: string;
  password: string;
  fullName: string;

  type: UserType;
  status: UserStatus;
  roles: ObjectId[] | [];

  avatar: string;
  gender: Gender;
  phoneNumber: string;
  address: ObjectId[] | []; // Address
  date_of_birth: Date;
  email_verify_token: string;
  forgot_password_verify_token: string;
  created_at: Date;
  updated_at: Date;

  constructor(user: UserInterface) {
    const date = new Date();
    this._id = user._id;
    this.email = user.email;
    this.password = user.password;
    this.fullName = user.fullName;

    this.type = user.type || UserType.Guest;
    this.status = user.status || UserStatus.Normal;
    this.roles = user.roles || [];

    this.avatar = user.avatar || '';
    this.gender = user.gender || Gender.Other;
    this.phoneNumber = user.phoneNumber || '';
    this.address = user.address || []; // Address
    this.date_of_birth = date;
    this.email_verify_token = user.email_verify_token || '';
    this.forgot_password_verify_token = user.forgot_password_verify_token || '';
    this.created_at = date;
    this.updated_at = date;
  }
}

export default User;
