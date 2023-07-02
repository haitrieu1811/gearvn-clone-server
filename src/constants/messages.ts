export const USERS_MESSAGES = {
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
  STREET_IS_REQUIRED: 'Address detail is required',
  STREET_MUST_BE_A_STRING: 'Address detail must be a string',
  ADDRESS_DETAIL_LENGTH: 'Address detail must length from 1 to 250 characters',
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
  UPDATE_ADDRESS_SUCCEED: 'Update address succeed'
} as const;
