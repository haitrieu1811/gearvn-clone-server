import { Collection, Db, MongoClient } from 'mongodb';

import { ENV_CONFIG } from '~/constants/config';
import Address from '~/models/schemas/Address.schema';
import Blog from '~/models/schemas/Blog.schema';
import Brand from '~/models/schemas/Brand.schema';
import Category from '~/models/schemas/Category.schema';
import Conversation from '~/models/schemas/Conversation.schema';
import Media from '~/models/schemas/Media.schema';
import Notification from '~/models/schemas/Notification.schema';
import Order from '~/models/schemas/Order.schema';
import Product from '~/models/schemas/Product.schema';
import Review from '~/models/schemas/Review.schema';
import Purchase from '~/models/schemas/Purchase.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import User from '~/models/schemas/User.schema';
import ViewedProduct from '~/models/schemas/ViewedProduct.schema';
import Voucher from '~/models/schemas/Voucher.schema';
import Message from '~/models/schemas/Message.schema';

const uri = `mongodb+srv://${ENV_CONFIG.DB_USERNAME}:${ENV_CONFIG.DB_PASSWORD}@gearvn-clone-cluster.ur6rvkl.mongodb.net/?retryWrites=true&w=majority`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(ENV_CONFIG.DB_NAME);
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

  async indexUsers() {
    const isExist = await this.users.indexExists([
      'email_1',
      'addresses_1',
      'forgot_password_token_1',
      'role_1',
      '_id_1_phone_number_1'
    ]);
    if (!isExist) {
      await Promise.all([
        this.users.createIndex({ email: 1 }, { unique: true }),
        this.users.createIndex({ addresses: 1 }),
        this.users.createIndex({ forgot_password_token: 1 }),
        this.users.createIndex({ role: 1 }),
        this.users.createIndex({ _id: 1, phone_number: 1 })
      ]);
    }
  }

  async indexPurchases() {
    const isExist = await this.purchases.indexExists(['product_id_1_user_id_1_status_1']);
    if (!isExist) {
      await this.purchases.createIndex({ product_id: 1, user_id: 1, status: 1 });
    }
  }

  async indexProducts() {
    const isExist = await this.products.indexExists(['name_vi_text_name_en_text']);
    if (!isExist) {
      await this.products.createIndex({ name_vi: 'text', name_en: 'text' });
    }
  }

  async indexOrders() {
    const isExist = await this.orders.indexExists(['user_id_1', 'user_id_1_status_1']);
    if (!isExist) {
      await Promise.all([
        this.orders.createIndex({ 'items.product_id': 1 }),
        this.orders.createIndex({ 'items.product_id': 1, status: 1 })
      ]);
    }
  }

  async indexRefreshTokens() {
    const isExist = await this.refresh_tokens.indexExists(['token_1', 'exp_1']);
    if (!isExist) {
      await Promise.all([
        this.refresh_tokens.createIndex({ token: 1 }, { unique: true }),
        this.refresh_tokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
      ]);
    }
  }

  async indexReviews() {
    const isExist = await this.reviews.indexExists([
      'product_id_1_user_id_1_parent_id_1',
      'parent_id_1',
      'parent_id_1_product_id_1'
    ]);
    if (!isExist) {
      await Promise.all([
        this.reviews.createIndex({ product_id: 1, user_id: 1, parent_id: 1 }),
        this.reviews.createIndex({ parent_id: 1 }),
        this.reviews.createIndex({ parent_id: 1, product_id: 1 })
      ]);
    }
  }

  async indexNotifications() {
    const isExist = await this.notifications.indexExists([
      'receiver_id_1_is_read_1',
      'receiver_id_1',
      '_id_1_receiver_id_1_is_read_1'
    ]);
    if (!isExist) {
      await Promise.all([
        this.notifications.createIndex({ receiver_id: 1 }),
        this.notifications.createIndex({ receiver_id: 1, is_read: 1 }),
        this.notifications.createIndex({ _id: 1, receiver_id: 1, is_read: 1 })
      ]);
    }
  }

  async indexConversations() {
    const isExist = await this.conversations.indexExists(['user_ids_1']);
    if (!isExist) {
      await Promise.all([this.conversations.createIndex({ user_ids: 1 })]);
    }
  }

  async indexMessages() {
    const isExist = await this.messages.indexExists(['conversation_id_1']);
    if (!isExist) {
      await Promise.all([this.messages.createIndex({ conversation_id: 1 })]);
    }
  }

  async indexVouchers() {
    const isExist = await this.vouchers.indexExists(['discount_unit_1', 'code_1', 'code_1_is_used_1']);
    if (!isExist) {
      await Promise.all([
        this.vouchers.createIndex({ discount_unit: 1 }),
        this.vouchers.createIndex({ code: 1 }, { unique: true }),
        this.vouchers.createIndex({ code: 1, is_used: 1 })
      ]);
    }
  }

  get users(): Collection<User> {
    return this.db.collection(ENV_CONFIG.DB_USERS_COLLECTION);
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(ENV_CONFIG.DB_REFRESH_TOKENS_COLLECTION);
  }

  get categories(): Collection<Category> {
    return this.db.collection(ENV_CONFIG.DB_CATEGORIES_COLLECTION);
  }

  get brands(): Collection<Brand> {
    return this.db.collection(ENV_CONFIG.DB_BRANDS_COLLECTION);
  }

  get products(): Collection<Product> {
    return this.db.collection(ENV_CONFIG.DB_PRODUCTS_COLLECTION);
  }

  get medias(): Collection<Media> {
    return this.db.collection(ENV_CONFIG.DB_MEDIAS_COLLECTION);
  }

  get purchases(): Collection<Purchase> {
    return this.db.collection(ENV_CONFIG.DB_PURCHASES_COLLECTION);
  }

  get orders(): Collection<Order> {
    return this.db.collection(ENV_CONFIG.DB_ORDERS_COLLECTION);
  }

  get blogs(): Collection<Blog> {
    return this.db.collection(ENV_CONFIG.DB_BLOGS_COLLECTION);
  }

  get viewedProducts(): Collection<ViewedProduct> {
    return this.db.collection(ENV_CONFIG.DB_VIEWED_PRODUCTS_COLLECTION);
  }

  get addresses(): Collection<Address> {
    return this.db.collection(ENV_CONFIG.DB_ADDRESSES_COLLECTION);
  }

  get reviews(): Collection<Review> {
    return this.db.collection(ENV_CONFIG.DB_REVIEWS_COLLECTION);
  }

  get notifications(): Collection<Notification> {
    return this.db.collection(ENV_CONFIG.DB_NOTIFICATIONS_COLLECTION);
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(ENV_CONFIG.DB_CONVERSATIONS_COLLECTION);
  }

  get messages(): Collection<Message> {
    return this.db.collection(ENV_CONFIG.DB_MESSAGES_COLLECTION);
  }

  get vouchers(): Collection<Voucher> {
    return this.db.collection(ENV_CONFIG.DB_VOUCHERS_COLLECTION);
  }
}

const databaseService = new DatabaseService();
export default databaseService;
