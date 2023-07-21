export const USERS_MESSAGES = {
  EMAIL_LENGTH: 'Email must length from 5 to 160 characters',
  VALIDATION_ERROR: 'Validation error',
  FULLNAME_MUST_BE_A_STRING: 'Fullname must be a string',
  EMAIL_MUST_BE_A_STRING: 'Email must be a string',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  EMAIL_IS_REQUIRED: 'Email is required',
  FULLNAME_IS_REQUIRED: 'Fullname is required',
  PASSWORD_IS_REQUIRED: 'Password is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_ALREADY_EXIST: 'Email already exist',
  PASSWORD_MUST_LENGTH_FROM_6_TO_32_CHARACTERS: 'Password must lenght from 6 to 32 characters',
  PASSWORD_MUST_BE_STRONG:
    'Password must contain at least 1 uppercase character, 1 lowercase character, 1 number and one special character',
  CONFIRM_PASSWORD_NOT_MATCH_PASSWORD: 'Confirm password does not match password',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  REGISTER_SUCCEED: 'Register account succeed',
  EMAIL_NOT_EXIST: 'Email not exist in our system',
  EMAIL_OR_PASSWORD_INCORRECT: 'Email or password incorrect',
  LOGIN_SUCCEED: 'Login succeed',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_MUST_BE_A_STRING: 'Access token must be a string',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Refresh token has been used or does not exist',
  LOGOUT_SUCCEED: 'Logout succeed',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_NOT_EXIST: 'Email verify token not exist',
  VERIFY_EMAIL_TOKEN_INVALID: 'Email verify token is invalid',
  VERIFY_EMAIL_SUCCEED: 'Email verify succeed',
  EMAIL_VERIFY_BEFORE: 'Email verify before',
  RESEND_EMAIL_VERIFY_SUCCEED: 'Resend email verify succeed',
  USER_NOT_FOUND: 'User not found',
  SEND_FORGOT_PASSWORD_EMAIL_SUCCESS: 'Password reset request email has been sent, please check your email',
  USER_IS_UNVERIFIED: 'User is unverified',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_NOT_EXIST: 'Forgot password token not exist',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCEED: 'Verify forgot password token succeed',
  UPDATE_PASSWORD_SUCCEED: 'Update password succeed',
  RESET_PASSWORD_SUCCEED: 'Reset password succeed',
  OLD_PASSWORD_IS_REQUIRED: 'Old password is required',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',
  UPDATE_PROFILE_SUCCEED: 'Update profile succeed',
  CHANGE_PASSWORD_SUCCEED: 'Change password succeed',
  GET_ME_SUCCEED: 'Get info me succeed',
  FULLNAME_MUST_LENGTH_FROM_1_TO_100_CHARACTERS: 'Fullname must length from 1 to 100 characters',
  PHONE_NUMBER_INVALID: 'Phone number is invalid',
  PHONE_NUMBER_IS_EXIST: 'Phone number is exist',
  DATE_OF_BIRTH_MUST_BE_A_ISO8601_STRING: 'Date of birth must be a ISO8601 string',
  IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string',
  IMAGE_URL_LENGTH: 'Image url must length from 1 to 250 characters',
  PROVINCE_IS_REQUIRED: 'Province is required',
  DISTRICT_IS_REQUIRED: 'District is required',
  WARD_IS_REQUIRED: 'Ward is required',
  STREET_IS_REQUIRED: 'Street is required',
  STREET_MUST_BE_A_STRING: 'Street must be a string',
  STREET_LENGTH: 'Street must length from 1 to 250 characters',
  ADDRESS_TYPE_IS_REQUIRED: 'Address type is required',
  PROVINCE_MUST_BE_A_STRING: 'Province must be a string',
  DISTRICT_MUST_BE_A_STRING: 'District must be a string',
  WARD_MUST_BE_A_STRING: 'Ward must be a string',
  ADDRESS_TYPE_MUST_BE_A_INTEGER: 'Address type must be a integer',
  ADD_ADDRESS_SUCCEED: 'Add address succeed',
  ADDRESS_ID_IS_REQUIRED: 'Address id is required',
  ADDRESS_ID_MUST_BE_A_STRING: 'Address id must be a string',
  DELETE_ADDRESS_SUCCEED: 'Delete address succeed',
  ADDRESS_NOT_EXIST: 'Address not exist',
  UPDATE_ADDRESS_SUCCEED: 'Update address succeed',
  ROLE_IS_REQUIRED: 'Role is required',
  ROLE_MUST_BE_A_NUMBER: 'Role must be a number',
  ROLE_IS_INVALID: 'Role is invalid',
  UPDATE_ROLE_SUCCEED: 'Update role succeed',
  REFRESH_TOKEN_SUCCEED: 'Refresh token succeed',
  ADDRESS_ID_INVALID: 'Address id is invalid',
  ADDRESS_MAXIMUM: 'Each user has a maximum of 3 addresses',
  ADDRESS_TYPE_IS_INVALID: 'Address type is invalid',
  PERMISSION_DENIED: 'Permission denied',
  EXPIRE_ACCESS_TOKEN_MUST_BE_A_INTEGER: 'Expire access token must be a integer',
  GET_USERS_LIST_SUCCEED: 'Get users list succeed',
  USER_IDS_IS_REQUIRED: 'User ids is required',
  USER_IDS_MUST_BE_AN_ARRAY: 'User ids must be an array',
  USER_IDS_NOT_EMPTY: 'User ids not empty',
  USER_IDS_IS_INVALID: 'User ids is invalid'
} as const;

export const CATEGORIES_MESSAGES = {
  GET_LIST_SUCCEED: 'Get category list succeed',
  NAME_IS_REQUIRED: 'Category name is required',
  NAME_MUST_BE_A_STRING: 'Category name must be a string',
  NAME_IS_EXIST: 'Category name is exist',
  CREATE_SUCCEED: 'Create category succeed',
  CATEGORY_ID_IS_REQUIRED: 'Category id is required',
  CATEGORY_NOT_FOUND: 'Category not found',
  UPDATE_SUCCEED: 'Update category succeed',
  CATEGORY_ID_INVALID: 'Category id is invalid',
  DELETE_SUCCEED: 'Delete category succeed',
  CATEGORY_NAME_LENGTH: 'Category name must length from 1 to 160 characters',
  GET_CATEGORY_SUCCEED: 'Get category succeed'
} as const;

export const MEDIAS_MESSAGES = {
  FILE_TYPE_INVALID: 'File type is invalid',
  IMAGE_FIELD_IS_REQUIRED: 'Image field is required',
  FILE_NOT_FOUND: 'File not found',
  UPLOAD_IMAGE_SUCCEED: 'Upload image succeed'
} as const;

export const PRODUCTS_MESSAGES = {
  BRAND_NAME_IS_REQUIRED: 'Brand name is required',
  BRAND_NAME_MUST_BE_A_STRING: 'Brand name must be a string',
  BRAND_IS_EXIST: 'Brand is exist',
  CREATE_BRAND_SUCCEED: 'Create brand succeed',
  BRAND_ID_IS_INVALID: 'Brand id is invalid',
  BRAND_NOT_FOUND: 'Brand not found',
  UPDATE_BRAND_SUCCEED: 'Update brand succeed',
  DELETE_BRAND_SUCCEED: 'Delete brand succeed',
  IMAGES_MUST_BE_AN_ARRAY: 'Image must be an array',
  ADD_IMAGE_SUCCEED: 'Add image succeed',
  PRODUCT_ID_IS_REQUIRED: 'Product id is required',
  PRODUCT_ID_IS_INVALID: 'Product id is invalid',
  PRODUCT_NOT_FOUND: 'Product not found',
  CREATE_PRODUCT_SUCCEED: 'Create product succeed',
  BRAND_ID_IS_REQUIRED: 'Brand id is required',
  BRAND_ID_MUST_BE_A_STRING: 'Brand id must be a string',
  CATEGORY_IDS_IS_REQUIRED: 'Category ids is required',
  CATEGORY_MUST_BE_A_STRING: 'Category id must be a string',
  CATEGORY_IDS_IS_INVALID: 'Has at least one invalid category id',
  CATEGORY_NOT_FOUND: 'Category not found',
  PRODUCT_THUMBNAIL_IS_REQUIRED: 'Product thumbnail is required',
  PRODUCT_THUMBNAIL_MUST_BE_A_STRING: 'Product thumbnail must be a string',
  PRODUCT_PRICE_IS_REQUIRED: 'Product price is required',
  PRODUCT_PRICE_MUST_BE_A_NUMBER: 'Product price must be a number',
  PRODUCT_GENERAL_INFO_MUST_BE_A_STRING: 'Product general info must be a string',
  PRODUCT_DESCRIPTION_MUST_BE_A_STRING: 'Product description must be a string',
  PRODUCT_IMAGES_MUST_BE_AN_STRING_ARRAY: 'Product images must be an string array',
  PRODUCT_SPECIFICATIONS_MUST_BE_A_STRING: 'Product specifiactions must be a string',
  PRODUCT_NAME_IS_REQUIRED: 'Product name is required',
  PRODUCT_NAME_MUST_IS_A_STRING: 'Product name must be a string',
  PRODUCT_NAME_LENGTH: 'Product name must length from 12 to 500 characters',
  DELETE_IMAGE_SUCCEED: 'Delete image succeed',
  IMAGE_ID_IS_REQUIRED: 'Image id is required',
  IMAGE_ID_IS_INVALID: 'Image id is invalid',
  IMAGE_NOT_FOUND: 'Image not found',
  UPDATE_PRODUCT_SUCCEED: 'Update product succeed',
  MEDIAS_IS_INVALID: 'Medias is invalid',
  IMAGES_IS_REQUIRED: 'Images is required',
  DELETE_PRODUCT_SUCCEED: 'Delete product succeed',
  GET_PRODUCT_LIST_SUCCEED: 'Get product list succeed',
  GET_PRODUCT_DETAIL_SUCCEED: 'Get product detail succeed',
  GET_BRANDS_SUCCEED: 'Get brands list succeed',
  GET_BRAND_SUCCEED: 'Get brand succeed',
  CATEGORY_ID_IS_REQUIRED: 'Category id is required',
  CATEGORY_ID_IS_INVALID: 'Category id is invalid',
  CATEGORY_IDS_MUST_BE_AN_ARRAY: 'Category ids must be an array',
  CATEGORY_IDS_NOT_EMPTY: 'Category ids not empty',
  BRAND_IDS_IS_REQUIRED: 'Brand ids is required',
  BRAND_IDS_MUST_BE_AN_ARRAY: 'Brand ids must be an array',
  BRAND_IDS_IS_INVALID: 'Brand ids is invalid',
  BRAND_IDS_NOT_EMPTY: 'Brand ids not empty',
  PRODUCT_IDS_IS_REQUIRED: 'Product ids is required',
  PRODUCT_IDS_MUST_BE_AN_ARRAY: 'Product ids must be an array',
  PRODUCT_IDS_NOT_EMPTY: 'Product ids not empty',
  PRODUCT_IDS_IS_INVALID: 'Product ids is invalid',
  PRICE_AFTER_DISCOUNT_MUST_LESS_THAN: 'Must be less than the init price',
  IMAGES_ITEM_MUST_BE_A_STRING: 'Image item must be a string'
} as const;

export const PURCHASES_MESSAGES = {
  ADD_TO_CART_SUCCEED: 'Add product to cart succeed',
  UPDATE_PURCHASE_SUCCEED: 'Update purchase succeed',
  DELETE_PURCHASE_SUCCEED: 'Delete purchase succeed',
  CHECKOUT_PURCHASE_SUCCEED: 'Checkout succeed',
  BUY_COUNT_IS_REQUIRED: 'Buy count is required',
  BUY_COUNT_MUST_BE_A_INTEGER: 'Buy count must be a integer',
  BUY_COUNT_MUST_BE_GREATER_THAN_0: 'Buy count must be greater than 0',
  PURCHASE_ID_IS_REQUIRED: 'Purchase id is required',
  PURCHASE_ID_IS_INVALID: 'Purchase id is invalid',
  PURCHASE_NOT_FOUND: 'Purchase not found',
  PURCHASE_IDS_IS_REQUIRED: 'Purchase ids is required',
  PURCHASE_IDS_MUST_BE_AN_ARRAY: 'Purchase ids must be an array',
  PURCHASE_IDS_INVALID: 'Purchase ids is invalid',
  PURCHASE_IDS_LENGTH: 'Purchase ids must have at least 1 item',
  CHECKOUT_SUCCEED: 'Checkout succeed',
  GET_CART_LIST_SUCCEED: 'Get cart list succeed',
  DELETE_ALL_PURCHASE_SUCCEED: 'Delete all purchase succeed'
} as const;

export const ORDERS_MESSAGES = {
  GET_ALL_ORDERS_SUCCEED: 'Get all orders succeed',
  GET_ORDERS_LIST_SUCCEED: 'Get order list succeed',
  ORDER_ID_IS_REQUIRED: 'Order id is required',
  ORDER_ID_IS_INVALID: 'Order id is invalid',
  ORDER_NOT_FOUND: 'Order not found',
  STATUS_IS_REQUIRED: 'Status is required',
  STATUS_IS_INVALID: 'Status is invalid',
  UPDATE_ORDER_STATUS_SUCCEED: 'Update order status succeed',
  DELETE_ORDER_SUCCEED: 'Delete order succeed'
} as const;

export const BLOGS_MESSAGES = {
  CREATE_BLOG_SUCCEED: 'Create blog succeed',
  THUMBNAIL_IS_REQUIRED: 'Thumbnail is required',
  THUMBNAIL_MUST_BE_A_STRING: 'Thumbnail must be a string',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  CONTENT_IS_REQUIRED: 'Content is required',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  STATUS_IS_REQUIRED: 'Blog status is required',
  STATUS_IS_INVALID: 'Blog status is in valid',
  UPDATE_BLOG_SUCCEED: 'Update blog succeed',
  BLOG_ID_IS_REQUIRED: 'Blog id is required',
  BLOG_ID_IS_INVALID: 'Blog id is invalid',
  BLOG_NOT_FOUND: 'Blog not found',
  DELETE_BLOG_SUCCEED: 'Delete blog succeed',
  GET_BLOG_LIST_SUCCEED: 'Get blog list succeed',
  GET_BLOG_DETAIL_SUCCEED: 'Get blog detail succeed',
  BLOG_IDS_IS_REQUIRED: 'Blog ids is required',
  BLOG_IDS_MUST_BE_AN_ARRAY: 'Blog ids must be an array',
  BLOG_IDS_NOT_EMPTY: 'Blog ids not empty',
  BLOG_IDS_IS_INVALID: 'Blog ids is invalid'
} as const;
