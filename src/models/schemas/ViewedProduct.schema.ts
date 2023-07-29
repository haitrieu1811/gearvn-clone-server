import { ObjectId } from 'mongodb';

interface ViewedProductType {
  _id?: ObjectId;
  product_id: ObjectId;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

class ViewedProduct {
  _id?: ObjectId;
  product_id: ObjectId;
  user_id: ObjectId;
  created_at: Date;
  updated_at: Date;

  constructor(viewedProduct: ViewedProductType) {
    const date = new Date();
    this._id = viewedProduct._id;
    this.product_id = viewedProduct.product_id;
    this.user_id = viewedProduct.user_id;
    this.created_at = viewedProduct.created_at || date;
    this.updated_at = viewedProduct.created_at || date;
  }
}

export default ViewedProduct;
