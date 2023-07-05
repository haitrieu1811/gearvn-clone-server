import { config } from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';
import Brand from '~/models/schemas/Brand.schema';

import Category from '~/models/schemas/Category.schema';
import Media from '~/models/schemas/Media.schema';
import Order from '~/models/schemas/Order.schema';
import Product from '~/models/schemas/Product.schema';
import Purchase from '~/models/schemas/Purchase.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import User from '~/models/schemas/User.schema';
config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@gearvn-clone-cluster.ur6rvkl.mongodb.net/?retryWrites=true&w=majority`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME);
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string);
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string);
  }

  get categories(): Collection<Category> {
    return this.db.collection(process.env.DB_CATEGORIES_COLLECTION as string);
  }

  get brands(): Collection<Brand> {
    return this.db.collection(process.env.DB_BRANDS_COLLECTION as string);
  }

  get products(): Collection<Product> {
    return this.db.collection(process.env.DB_PRODUCTS_COLLECTION as string);
  }

  get medias(): Collection<Media> {
    return this.db.collection(process.env.DB_MEDIAS_COLLECTION as string);
  }

  get purchases(): Collection<Purchase> {
    return this.db.collection(process.env.DB_PURCHASES_COLLECTION as string);
  }

  get orders(): Collection<Order> {
    return this.db.collection(process.env.DB_ORDERS_COLLECTION as string);
  }
}

const databaseService = new DatabaseService();
export default databaseService;
