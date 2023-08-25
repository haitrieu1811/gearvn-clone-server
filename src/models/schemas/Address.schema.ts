import { ObjectId } from 'mongodb';
import { AddressType } from '~/constants/enum';

interface AddressConstructor {
  _id?: ObjectId;
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
  is_default: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class Address {
  _id?: ObjectId;
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;

  constructor({ _id, province, district, ward, street, type, is_default, created_at, updated_at }: AddressConstructor) {
    const date = new Date();
    this._id = _id;
    this.province = province;
    this.district = district;
    this.ward = ward;
    this.street = street;
    this.type = type;
    this.is_default = is_default;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Address;
