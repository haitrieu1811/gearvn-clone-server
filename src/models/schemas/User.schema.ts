import { ObjectId } from 'mongodb';
import { Gender, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum';

interface UserConstructor {
  _id?: ObjectId;
  email: string;
  password: string;
  status?: UserStatus;
  role?: UserRole;
  fullname?: string;
  avatar?: string;
  gender?: Gender;
  verify?: UserVerifyStatus;
  phone_number?: string;
  addresses?: string[];
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
  fullname: string;
  status: UserStatus;
  role: UserRole;
  avatar: string;
  gender: Gender;
  verify: UserVerifyStatus;
  phone_number: string;
  addresses: ObjectId[];
  date_of_birth: Date;
  email_verify_token: string;
  forgot_password_token: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    _id,
    email,
    password,
    status,
    role,
    fullname,
    avatar,
    gender,
    verify,
    phone_number,
    addresses,
    date_of_birth,
    email_verify_token,
    forgot_password_token,
    created_at,
    updated_at
  }: UserConstructor) {
    const date = new Date();
    this._id = _id;
    this.email = email;
    this.password = password;
    this.status = status || UserStatus.Active;
    this.role = role || UserRole.Customer;
    this.fullname = fullname || '';
    this.avatar = avatar || '';
    this.gender = gender || Gender.Other;
    this.verify = verify || UserVerifyStatus.Unverified;
    this.phone_number = phone_number || '';
    this.addresses = addresses ? addresses.map((address) => new ObjectId(address)) : [];
    this.date_of_birth = date_of_birth || date;
    this.email_verify_token = email_verify_token || '';
    this.forgot_password_token = forgot_password_token || '';
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default User;
