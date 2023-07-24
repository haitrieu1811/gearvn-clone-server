import { ObjectId } from 'mongodb';
import { AddressType, Gender, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum';

export interface Address {
  _id: ObjectId;
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
  isDefault: boolean;
}

interface UserInterface {
  _id?: ObjectId;
  email: string;
  password: string;
  status?: UserStatus;
  role?: UserRole;
  fullName?: string;
  avatar?: string;
  gender?: Gender;
  verify?: UserVerifyStatus;
  phoneNumber?: string;
  addresses?: Address[];
  date_of_birth?: Date;
  email_verify_token?: string;
  forgot_password_token?: string;
  created_at?: Date;
  updated_at?: Date;
}

class User {
  _id?: ObjectId;
  email: string;
  password: string;
  fullName: string;
  status: UserStatus;
  role: UserRole;
  avatar: string;
  gender: Gender;
  verify: UserVerifyStatus;
  phoneNumber: string;
  addresses: Address[];
  date_of_birth: Date;
  email_verify_token: string;
  forgot_password_token: string;
  created_at: Date;
  updated_at: Date;

  constructor(user: UserInterface) {
    const date = new Date();
    this._id = user._id;
    this.email = user.email;
    this.password = user.password;
    this.status = user.status || UserStatus.Active;
    this.role = user.role || UserRole.Customer;
    this.fullName = user.fullName || '';
    this.avatar = user.avatar || '';
    this.gender = user.gender || Gender.Other;
    this.verify = user.verify || UserVerifyStatus.Unverified;
    this.phoneNumber = user.phoneNumber || '';
    this.addresses = user.addresses || [];
    this.date_of_birth = date;
    this.email_verify_token = user.email_verify_token || '';
    this.forgot_password_token = user.forgot_password_token || '';
    this.created_at = date;
    this.updated_at = date;
  }
}

export default User;
