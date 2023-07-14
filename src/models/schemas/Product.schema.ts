import { ObjectId } from 'mongodb';

export interface ProductType {
  _id?: ObjectId;
  name_vi: string;
  name_en?: string;
  thumbnail?: string;
  price: number;
  price_after_discount?: number;
  general_info?: string;
  description?: string;
  images?: ObjectId[];
  brand_id: ObjectId;
  category_id: ObjectId;
  specifications?: string;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

class Product {
  _id?: ObjectId;
  name_vi: string;
  name_en: string;
  thumbnail: string;
  price: number;
  price_after_discount: number;
  general_info: string;
  description: string;
  images: ObjectId[];
  brand_id: ObjectId;
  category_id: ObjectId;
  specifications: string; // Vẽ một table
  user_id: ObjectId;
  created_at: Date;
  updated_at: Date;

  constructor(product: ProductType) {
    const date = new Date();
    this._id = product._id;
    this.name_vi = product.name_vi;
    this.name_en = product.name_en || '';
    this.thumbnail = product.thumbnail || '';
    this.price = product.price;
    this.price_after_discount = product.price_after_discount || product.price;
    this.general_info = product.general_info || '';
    this.description = product.description || '';
    this.images = product.images || [];
    this.brand_id = product.brand_id;
    this.category_id = product.category_id;
    this.specifications = product.specifications || ''; // Vẽ một table
    this.user_id = product.user_id;
    this.created_at = date;
    this.updated_at = date;
  }
}

export default Product;
