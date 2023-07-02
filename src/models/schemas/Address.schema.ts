import { ObjectId } from 'mongodb';
import { AddressType } from '~/constants/enum';

interface AddressInterface {
  _id?: ObjectId;
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
  user_id: ObjectId;
}

class Address {
  _id?: ObjectId;
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
  user_id: ObjectId;

  constructor(address: AddressInterface) {
    this._id = address._id;
    this.province = address.province;
    this.district = address.district;
    this.ward = address.ward;
    this.street = address.street;
    this.type = address.type;
    this.user_id = address.user_id;
  }
}

export default Address;
