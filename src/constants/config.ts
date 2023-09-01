import argv from 'minimist';
import { config } from 'dotenv';
config();

const options = argv(process.argv.slice(2));

export const isProduction = Boolean(options.production);

export const ENV_CONFIG = {
  PORT: process.env.PORT as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  HOST: process.env.HOST as string,
  PASSWORD_SECRET: process.env.PASSWORD_SECRET as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_USERS_COLLECTION: process.env.DB_USERS_COLLECTION as string,
  DB_REFRESH_TOKENS_COLLECTION: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  DB_CATEGORIES_COLLECTION: process.env.DB_CATEGORIES_COLLECTION as string,
  DB_BRANDS_COLLECTION: process.env.DB_BRANDS_COLLECTION as string,
  DB_PRODUCTS_COLLECTION: process.env.DB_PRODUCTS_COLLECTION as string,
  DB_MEDIAS_COLLECTION: process.env.DB_MEDIAS_COLLECTION as string,
  DB_PURCHASES_COLLECTION: process.env.DB_PURCHASES_COLLECTION as string,
  DB_ORDERS_COLLECTION: process.env.DB_ORDERS_COLLECTION as string,
  DB_BLOGS_COLLECTION: process.env.DB_BLOGS_COLLECTION as string,
  DB_VIEWED_PRODUCTS_COLLECTION: process.env.DB_VIEWED_PRODUCTS_COLLECTION as string,
  DB_ADDRESSES_COLLECTION: process.env.DB_ADDRESSES_COLLECTION as string,
  DB_PRODUCT_REVIEWS_COLLECTION: process.env.DB_PRODUCT_REVIEWS_COLLECTION as string,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  VERIFY_EMAIL_TOKEN_EXPIRES_IN: process.env.VERIFY_EMAIL_TOKEN_EXPIRES_IN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_REGION: process.env.AWS_REGION as string,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS as string,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME as string
} as const;
