import { ObjectId } from 'mongodb';
import { VoucherDiscountUnit } from '~/constants/enum';

interface VoucherConstructor {
  _id?: ObjectId;
  user_id: ObjectId;
  name?: string;
  description?: string;
  discount: number;
  discount_unit: VoucherDiscountUnit;
  code: string;
  is_used?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class Voucher {
  _id?: ObjectId;
  user_id: ObjectId;
  name: string;
  description: string;
  discount: number;
  discount_unit: VoucherDiscountUnit;
  code: string;
  is_used: boolean;
  created_at: Date;
  updated_at: Date;

  constructor({
    _id,
    user_id,
    name,
    description,
    discount,
    discount_unit,
    code,
    is_used,
    created_at,
    updated_at
  }: VoucherConstructor) {
    const date = new Date();
    this._id = _id;
    this.user_id = user_id;
    this.name = name || '';
    this.description = description || '';
    this.discount = discount;
    this.discount_unit = discount_unit;
    this.code = code;
    this.is_used = is_used || false;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Voucher;
