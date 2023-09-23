export const USERS_MESSAGES = {
  EMAIL_LENGTH: 'Email phải có độ dài từ 5 đến 160 ký tự',
  VALIDATION_ERROR: 'Lỗi xác thực',
  FULLNAME_MUST_BE_A_STRING: 'Họ tên phải là một chuỗi',
  EMAIL_MUST_BE_A_STRING: 'Email phải là một chuỗi',
  PASSWORD_MUST_BE_A_STRING: 'Mật khẩu phải là một chuỗi',
  EMAIL_IS_REQUIRED: 'Email là bắt buộc',
  FULLNAME_IS_REQUIRED: 'Họ tên là bắt buộc',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc',
  EMAIL_IS_INVALID: 'Email không hợp lệ',
  EMAIL_ALREADY_EXIST: 'Email đã tồn tại',
  PASSWORD_MUST_LENGTH_FROM_6_TO_32_CHARACTERS: 'Mật khẩu phải có độ dài từ 6 đến 32 ký tự',
  PASSWORD_MUST_BE_STRONG: 'Mật khẩu phải chứa ít nhất 1 ký tự viết hoa, 1 ký tự viết thường, 1 số và 1 ký tự đặc biệt',
  CONFIRM_PASSWORD_NOT_MATCH_PASSWORD: 'Xác nhận mật khẩu không khớp với mật khẩu',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Xác nhận mật khẩu là bắt buộc',
  REGISTER_SUCCEED: 'Đăng ký tài khoản thành công',
  EMAIL_NOT_EXIST: 'Email không tồn tại trong hệ thống',
  EMAIL_OR_PASSWORD_INCORRECT: 'Email hoặc mật khẩu không chính xác',
  LOGIN_SUCCEED: 'Đăng nhập thành công',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc',
  ACCESS_TOKEN_MUST_BE_A_STRING: 'Access token phải là một chuỗi',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắt buộc',
  REFRESH_TOKEN_INVALID: 'Refresh token không hợp lệ',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Refresh token đã được sử dụng hoặc không tồn tại',
  LOGOUT_SUCCEED: 'Đăng xuất thành công',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token là bắt buộc',
  EMAIL_VERIFY_TOKEN_NOT_EXIST: 'Email verify token không tồn tại',
  VERIFY_EMAIL_TOKEN_INVALID: 'Email verify token không hợp lệ',
  VERIFY_EMAIL_SUCCEED: 'Xác thực email thành công',
  EMAIL_VERIFY_BEFORE: 'Email đã được xác thực trước đó',
  RESEND_EMAIL_VERIFY_SUCCEED: 'Gửi lại email xác thực thành công',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  SEND_FORGOT_PASSWORD_EMAIL_SUCCESS: 'Email yêu cầu đặt lại mật khẩu đã được gửi, vui lòng kiểm tra email của bạn',
  USER_IS_UNVERIFIED: 'Người dùng chưa được xác thực',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token là bắt buộc',
  FORGOT_PASSWORD_TOKEN_NOT_EXIST: 'Forgot password token không tồn tại',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCEED: 'Xác thực forgot password token thành công',
  UPDATE_PASSWORD_SUCCEED: 'Cập nhật mật khẩu thành công',
  RESET_PASSWORD_SUCCEED: 'Đặt lại mật khẩu thành công',
  OLD_PASSWORD_IS_REQUIRED: 'Mật khẩu cũ là bắt buộc',
  OLD_PASSWORD_INCORRECT: 'Mật khẩu cũ không chính xác',
  UPDATE_PROFILE_SUCCEED: 'Cập nhật thông tin thành công',
  CHANGE_PASSWORD_SUCCEED: 'Thay đổi mật khẩu thành công',
  GET_ME_SUCCEED: 'Lấy thông tin tôi thành công',
  FULLNAME_MUST_LENGTH_FROM_1_TO_100_CHARACTERS: 'Họ tên phải có độ dài từ 1 đến 100 ký tự',
  PHONE_NUMBER_INVALID: 'Số điện thoại không hợp lệ',
  PHONE_NUMBER_IS_EXIST: 'Số điện thoại đã tồn tại',
  DATE_OF_BIRTH_MUST_BE_A_ISO8601_STRING: 'Ngày sinh phải là chuỗi ISO8601',
  IMAGE_URL_MUST_BE_A_STRING: 'Đường dẫn ảnh phải là một chuỗi',
  IMAGE_URL_LENGTH: 'Đường dẫn ảnh phải có độ dài từ 1 đến 250 ký tự',
  PROVINCE_IS_REQUIRED: 'Tỉnh/Thành phố là bắt buộc',
  DISTRICT_IS_REQUIRED: 'Quận/Huyện là bắt buộc',
  WARD_IS_REQUIRED: 'Phường/xã là bắt buộc',
  STREET_IS_REQUIRED: 'Đường/Phố là bắt buộc',
  STREET_MUST_BE_A_STRING: 'Đường/Phố phải là một chuỗi',
  STREET_LENGTH: 'Đường/Phố phải có độ dài từ 1 đến 250 ký tự',
  ADDRESS_TYPE_IS_REQUIRED: 'Loại địa chỉ là bắt buộc',
  PROVINCE_MUST_BE_A_STRING: 'Tỉnh/Thành phố phải là một chuỗi',
  DISTRICT_MUST_BE_A_STRING: 'Quận/Huyện phải là một chuỗi',
  WARD_MUST_BE_A_STRING: 'Phường/Xã phải là một chuỗi',
  ADDRESS_TYPE_MUST_BE_A_INTEGER: 'Loại địa chỉ phải là một số nguyên',
  ADD_ADDRESS_SUCCEED: 'Thêm địa chỉ thành công',
  ADDRESS_ID_IS_REQUIRED: 'ID địa chỉ là bắt buộc',
  ADDRESS_ID_MUST_BE_A_STRING: 'ID địa chỉ phải là một chuỗi',
  DELETE_ADDRESS_SUCCEED: 'Xóa địa chỉ thành công',
  ADDRESS_NOT_EXIST: 'Địa chỉ không tồn tại',
  UPDATE_ADDRESS_SUCCEED: 'Cập nhật địa chỉ thành công',
  ROLE_IS_REQUIRED: 'Vai trò là bắt buộc',
  ROLE_MUST_BE_A_NUMBER: 'Role phải là một số',
  ROLE_IS_INVALID: 'Role không hợp lệ',
  UPDATE_ROLE_SUCCEED: 'Cập nhật role thành công',
  REFRESH_TOKEN_SUCCEED: 'Làm mới token thành công',
  ADDRESS_ID_INVALID: 'ID địa chỉ không hợp lệ',
  ADDRESS_TYPE_IS_INVALID: 'Loại địa chỉ không hợp lệ',
  PERMISSION_DENIED: 'Quyền truy cập bị từ chối',
  EXPIRE_ACCESS_TOKEN_MUST_BE_A_INTEGER: 'Thời gian hết hạn của access token phải là một số nguyên',
  GET_USERS_LIST_SUCCEED: 'Lấy danh sách người dùng thành công',
  USER_IDS_IS_REQUIRED: 'ID người dùng là bắt buộc',
  USER_IDS_MUST_BE_AN_ARRAY: 'ID người dùng phải là một mảng',
  USER_IDS_NOT_EMPTY: 'ID người dùng không được rỗng',
  USER_IDS_IS_INVALID: 'ID người dùng không hợp lệ',
  PHONE_NUMBER_IS_REQUIRED: 'Số điện thoại là bắt buộc',
  SET_DEFAULT_ADDRESS_SUCCEED: 'Đặt địa chỉ mặc định thành công',
  ADDRESS_DEFAULT_VALUE_IS_REQUIRED: 'Giá trị mặc định của địa chỉ là bắt buộc',
  ADDRESS_DEFAULT_VALUE_MUST_BE_A_BOOLEAN: 'Giá trị mặc định của địa chỉ phải là một giá trị boolean',
  GET_ADDRESS_SUCCEED: 'Lấy địa chỉ thành công',
  ADD_OR_UPDATE_VIEWED_PRODUCT_SUCCEED: 'Thêm hoặc cập nhật sản phẩm đã xem thành công',
  GET_VIEWED_PRODUCTS_SUCCEED: 'Lấy danh sách sản phẩm đã xem thành công',
  GET_QUANTITY_PER_COLLECTION_SUCCEED: 'Lấy số lượng sản phẩm theo bộ sưu tập thành công',
  GET_ADDRESSES_SUCCEED: 'Lấy danh sách địa chỉ thành công',
  ADDRESS_IS_DEFAULT: 'Địa chỉ là mặc định',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Token quên mật khẩu không hợp lệ',
  VERIFY_FORFOT_PASSWORD_TOKEN_SUCCEED: 'Xác minh token quên mật khẩu thành công',
  USER_ID_IS_REQUIRED: 'ID người dùng là bắt buộc',
  USER_ID_IS_INVALID: 'ID người dùng không hợp lệ',
  USER_NOT_EXISTED: 'Người dùng không tồn tại'
} as const;

export const CATEGORIES_MESSAGES = {
  GET_LIST_SUCCEED: 'Lấy danh sách danh mục thành công',
  NAME_IS_REQUIRED: 'Yêu cầu tên danh mục',
  NAME_MUST_BE_A_STRING: 'Tên danh mục phải là một chuỗi',
  NAME_IS_EXIST: 'Tên danh mục đã tồn tại',
  CREATE_SUCCEED: 'Tạo danh mục thành công',
  CATEGORY_ID_IS_REQUIRED: 'Yêu cầu ID danh mục',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục',
  UPDATE_SUCCEED: 'Cập nhật danh mục thành công',
  CATEGORY_ID_INVALID: 'ID danh mục không hợp lệ',
  DELETE_SUCCEED: 'Xóa danh mục thành công',
  CATEGORY_NAME_LENGTH: 'Tên danh mục phải có độ dài từ 1 đến 160 ký tự',
  GET_CATEGORY_SUCCEED: 'Lấy thông tin danh mục thành công'
} as const;

export const MEDIAS_MESSAGES = {
  FILE_TYPE_INVALID: 'Loại tệp tin không hợp lệ',
  IMAGE_FIELD_IS_REQUIRED: 'Trường hình ảnh là bắt buộc',
  FILE_NOT_FOUND: 'Không tìm thấy tệp tin',
  UPLOAD_IMAGE_SUCCEED: 'Tải ảnh lên thành công',
  DELETE_IMAGES_SUCCEED: 'Xóa tệp tin thành công',
  MEDIA_IDS_IS_REQUIRED: 'ID tệp tin là bắt buộc',
  MEDIA_IDS_MUST_BE_ARRAY: 'ID tệp tin phải là một mảng',
  MEDIA_IDS_MUST_BE_ARRAY_AND_NOT_EMPTY: 'ID tệp tin phải là một mảng và không được rỗng',
  MEDIA_IDS_MUST_BE_ARRAY_OF_OBJECT_ID: 'ID tệp tin phải là một mảng của ObjectId'
} as const;

export const PRODUCTS_MESSAGES = {
  BRAND_NAME_IS_REQUIRED: 'Tên thương hiệu là bắt buộc',
  BRAND_NAME_MUST_BE_A_STRING: 'Tên thương hiệu phải là một chuỗi',
  BRAND_IS_EXIST: 'Thương hiệu đã tồn tại',
  CREATE_BRAND_SUCCEED: 'Tạo thương hiệu thành công',
  BRAND_ID_IS_INVALID: 'ID thương hiệu không hợp lệ',
  BRAND_NOT_FOUND: 'Không tìm thấy thương hiệu',
  UPDATE_BRAND_SUCCEED: 'Cập nhật thương hiệu thành công',
  DELETE_BRAND_SUCCEED: 'Xóa thương hiệu thành công',
  IMAGES_MUST_BE_AN_ARRAY: 'Hình ảnh phải là một mảng',
  ADD_IMAGE_SUCCEED: 'Thêm hình ảnh thành công',
  PRODUCT_ID_IS_REQUIRED: 'ID sản phẩm là bắt buộc',
  PRODUCT_ID_IS_INVALID: 'ID sản phẩm không hợp lệ',
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
  CREATE_PRODUCT_SUCCEED: 'Tạo sản phẩm thành công',
  BRAND_ID_IS_REQUIRED: 'ID thương hiệu là bắt buộc',
  BRAND_ID_MUST_BE_A_STRING: 'ID thương hiệu phải là một chuỗi',
  CATEGORY_IDS_IS_REQUIRED: 'ID danh mục là bắt buộc',
  CATEGORY_MUST_BE_A_STRING: 'ID danh mục phải là một chuỗi',
  CATEGORY_IDS_IS_INVALID: 'Có ít nhất một ID danh mục không hợp lệ',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục',
  PRODUCT_THUMBNAIL_IS_REQUIRED: 'Yêu cầu hình ảnh đại diện sản phẩm',
  PRODUCT_THUMBNAIL_MUST_BE_A_STRING: 'Hình ảnh đại diện sản phẩm phải là một chuỗi',
  PRODUCT_PRICE_IS_REQUIRED: 'Yêu cầu giá sản phẩm',
  PRODUCT_PRICE_MUST_BE_A_NUMBER: 'Giá sản phẩm phải là một số',
  PRODUCT_GENERAL_INFO_MUST_BE_A_STRING: 'Thông tin chung về sản phẩm phải là một chuỗi',
  PRODUCT_DESCRIPTION_MUST_BE_A_STRING: 'Mô tả sản phẩm phải là một chuỗi',
  PRODUCT_IMAGES_MUST_BE_AN_STRING_ARRAY: 'Hình ảnh sản phẩm phải là một mảng chuỗi',
  PRODUCT_SPECIFICATIONS_MUST_BE_A_STRING: 'Thông số kỹ thuật sản phẩm phải là một chuỗi',
  PRODUCT_NAME_IS_REQUIRED: 'Yêu cầu tên sản phẩm',
  PRODUCT_NAME_MUST_IS_A_STRING: 'Tên sản phẩm phải là một chuỗi',
  PRODUCT_NAME_LENGTH: 'Tên sản phẩm phải có độ dài từ 12 đến 500 ký tự',
  DELETE_IMAGE_SUCCEED: 'Xóa hình ảnh thành công',
  IMAGE_ID_IS_REQUIRED: 'Yêu cầu ID hình ảnh',
  IMAGE_ID_IS_INVALID: 'ID hình ảnh không hợp lệ',
  IMAGE_NOT_FOUND: 'Không tìm thấy hình ảnh',
  UPDATE_PRODUCT_SUCCEED: 'Cập nhật sản phẩm thành công',
  MEDIAS_IS_INVALID: 'Medias không hợp lệ',
  IMAGES_IS_REQUIRED: 'Yêu cầu hình ảnh',
  DELETE_PRODUCT_SUCCEED: 'Xóa sản phẩm thành công',
  GET_PRODUCT_LIST_SUCCEED: 'Lấy danh sách sản phẩm thành công',
  GET_PRODUCT_DETAIL_SUCCEED: 'Lấy chi tiết sản phẩm thành công',
  GET_BRANDS_SUCCEED: 'Lấy danh sách thương hiệu thành công',
  GET_BRAND_SUCCEED: 'Lấy thông tin thương hiệu thành công',
  CATEGORY_ID_IS_REQUIRED: 'Yêu cầu ID danh mục',
  CATEGORY_ID_IS_INVALID: 'ID danh mục không hợp lệ',
  CATEGORY_IDS_MUST_BE_AN_ARRAY: 'ID danh mục phải là một mảng',
  CATEGORY_IDS_NOT_EMPTY: 'ID danh mục không được để trống',
  BRAND_IDS_IS_REQUIRED: 'Yêu cầu ID thương hiệu',
  BRAND_IDS_MUST_BE_AN_ARRAY: 'ID thương hiệu phải là một mảng',
  BRAND_IDS_IS_INVALID: 'ID thương hiệu không hợp lệ',
  BRAND_IDS_NOT_EMPTY: 'ID thương hiệu không được để trống',
  PRODUCT_IDS_IS_REQUIRED: 'Yêu cầu ID sản phẩm',
  PRODUCT_IDS_MUST_BE_AN_ARRAY: 'ID sản phẩm phải là một mảng',
  PRODUCT_IDS_NOT_EMPTY: 'ID sản phẩm không được để trống',
  PRODUCT_IDS_IS_INVALID: 'ID sản phẩm không hợp lệ',
  PRICE_AFTER_DISCOUNT_MUST_LESS_THAN: 'Giá sau khi giảm giá phải nhỏ hơn giá ban đầu',
  IMAGES_ITEM_MUST_BE_A_STRING: 'Mục hình ảnh phải là một chuỗi',
  PRODUCT_ID_MUST_BE_A_STRING: 'ID sản phẩm phải là một chuỗi',
  PRODUCT_AVAILABLE_COUNT_IS_REQUIRED: 'Yêu cầu số lượng sản phẩm có sẵn',
  PRODUCT_AVAILABLE_COUNT_MUST_BE_A_NUMBER: 'Số lượng sản phẩm có sẵn phải là một số',
  PRODUCT_AVAILABLE_COUNT_MUST_BE_GREATER_OR_EQUAL_ZERO: 'Số lượng sản phẩm có sẵn phải lớn hơn hoặc bằng 0',
  PRODUCT_REVIEW_RATING_IS_REQUIRED: 'Yêu cầu đánh giá sản phẩm',
  PRODUCT_REVIEW_RATING_MUST_BE_A_NUMBER: 'Đánh giá sản phẩm phải là một số',
  PRODUCT_REVIEW_RATING_MUST_BE_BETWEEN_ONE_AND_FIVE: 'Đánh giá sản phẩm phải từ 1 đến 5',
  PRODUCT_REVIEW_COMMENT_MUST_BE_A_STRING: 'Bình luận đánh giá sản phẩm phải là một chuỗi',
  ADD_REVIEW_SUCCEED: 'Thêm đánh giá thành công',
  PRODUCT_REVIEW_ID_IS_REQUIRED: 'Yêu cầu ID đánh giá sản phẩm',
  PRODUCT_REVIEW_ID_MUST_BE_A_STRING: 'ID đánh giá sản phẩm phải là một chuỗi',
  PRODUCT_REVIEW_ID_IS_INVALID: 'ID đánh giá sản phẩm không hợp lệ',
  PRODUCT_REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá sản phẩm',
  PRODUCT_REVIEW_ID_MUST_BE_NULL: 'ID đánh giá sản phẩm phải là null',
  GET_REVIEWS_SUCCEED: 'Lấy danh sách đánh giá thành công',
  GET_REVIEW_REPLIES_SUCCEED: 'Lấy danh sách phản hồi đánh giá thành công',
  PRODUCT_REVIEW_RATING_MUST_BE_AN_INTEGER: 'Đánh giá sản phẩm phải là một số nguyên',
  UPDATE_REVIEW_SUCCEED: 'Cập nhật đánh giá thành công',
  PRODUCT_REVIEW_IMAGES_MUST_BE_AN_STRING_ARRAY: 'Hình ảnh đánh giá sản phẩm phải là một mảng chuỗi',
  PRODUCT_REVIEW_IMAGES_ITEM_MUST_BE_A_STRING: 'Mục hình ảnh đánh giá sản phẩm phải là một chuỗi',
  GET_REVIEW_DETAIL_SUCCEED: 'Lấy chi tiết đánh giá thành công',
  RATING_MUST_BE_NULL: 'Đánh giá phải là null',
  DELETE_REVIEW_IMAGE_SUCCEED: 'Xóa hình ảnh đánh giá thành công',
  DELETE_REVIEW_SUCCEED: 'Xóa đánh giá thành công'
} as const;

export const PURCHASES_MESSAGES = {
  ADD_TO_CART_SUCCEED: 'Thêm sản phẩm vào giỏ hàng thành công',
  UPDATE_PURCHASE_SUCCEED: 'Cập nhật đơn hàng thành công',
  DELETE_PURCHASE_SUCCEED: 'Xóa đơn hàng thành công',
  CHECKOUT_PURCHASE_SUCCEED: 'Thanh toán đơn hàng thành công',
  BUY_COUNT_IS_REQUIRED: 'Yêu cầu số lượng mua',
  BUY_COUNT_MUST_BE_A_INTEGER: 'Số lượng mua phải là một số nguyên',
  BUY_COUNT_MUST_BE_GREATER_THAN_0: 'Số lượng mua phải lớn hơn 0',
  PURCHASE_ID_IS_REQUIRED: 'Yêu cầu ID đơn hàng',
  PURCHASE_ID_IS_INVALID: 'ID đơn hàng không hợp lệ',
  PURCHASE_NOT_FOUND: 'Không tìm thấy đơn hàng',
  PURCHASE_IDS_IS_REQUIRED: 'Yêu cầu ID đơn hàng',
  PURCHASE_IDS_MUST_BE_AN_ARRAY: 'ID đơn hàng phải là một mảng',
  PURCHASE_IDS_INVALID: 'ID đơn hàng không hợp lệ',
  PURCHASE_IDS_LENGTH: 'ID đơn hàng phải có ít nhất 1 mục',
  CHECKOUT_SUCCEED: 'Thanh toán đơn hàng thành công',
  GET_CART_LIST_SUCCEED: 'Lấy danh sách giỏ hàng thành công',
  DELETE_ALL_PURCHASE_SUCCEED: 'Xóa tất cả đơn hàng thành công',
  NOTE_MUST_BE_A_STRING: 'Ghi chú phải là một chuỗi',
  NOTE_LENGTH: 'Ghi chú phải có độ dài từ 1 đến 250 ký tự',
  TRANSPORT_FEE_MUST_BE_A_NUMBER: 'Phí vận chuyển phải là một số',
  TOTAL_AMOUNT_MUST_BE_A_NUMBER: 'Tổng số tiền phải là một số',
  TOTAL_AMOUNT_REDUCED_MUST_BE_A_NUMBER: 'Tổng số tiền giảm giá phải là một số',
  TOTAL_ITEMS_MUST_BE_A_NUMBER: 'Tổng số mặt hàng phải là một số',
  RECEIVE_METHOD_IS_REQUIRED: 'Yêu cầu phương thức nhận hàng',
  RECEIVE_METHOD_IS_INVALID: 'Phương thức nhận hàng không hợp lệ',
  TOTAL_AMOUNT_IS_REQUIRED: 'Tổng số tiền là bắt buộc',
  TOTAL_ITEMS_IS_REQUIRED: 'Tổng số mặt hàng là bắt buộc',
  RECEIVE_METHOD_MUST_BE_A_NUMBER: 'Phương thức nhận hàng phải là một số',
  PAYMENT_METHOD_IS_REQUIRED: 'Yêu cầu phương thức thanh toán',
  PAYMENT_METHOD_IS_INVALID: 'Phương thức thanh toán không hợp lệ',
  PAYMENT_METHOD_MUST_BE_A_NUMBER: 'Phương thức thanh toán phải là một số',
  STATUS_IS_REQUIRED: 'Trạng thái là bắt buộc',
  STATUS_IS_INVALID: 'Trạng thái không hợp lệ',
  STATUS_MUST_BE_A_NUMBER: 'Trạng thái phải là một số',
  RECEIVE_METHOD_INVALID: 'Phương thức nhận hàng không hợp lệ',
  PAYMENT_METHOD_INVALID: 'Phương thức thanh toán không hợp lệ',
  STATUS_INVALID: 'Trạng thái không hợp lệ'
} as const;

export const ORDERS_MESSAGES = {
  GET_ALL_ORDERS_SUCCEED: 'Lấy tất cả đơn hàng thành công',
  GET_ORDERS_LIST_SUCCEED: 'Lấy danh sách đơn hàng thành công',
  ORDER_ID_IS_REQUIRED: 'Yêu cầu ID đơn hàng',
  ORDER_ID_IS_INVALID: 'ID đơn hàng không hợp lệ',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  STATUS_IS_REQUIRED: 'Yêu cầu trạng thái',
  STATUS_IS_INVALID: 'Trạng thái không hợp lệ',
  UPDATE_ORDER_STATUS_SUCCEED: 'Cập nhật trạng thái đơn hàng thành công',
  DELETE_ORDER_SUCCEED: 'Xóa đơn hàng thành công',
  GET_ORDERS_QUANTITY_SUCCEED: 'Lấy số lượng đơn hàng thành công',
  GET_ORDER_DETAIL_SUCCEED: 'Lấy chi tiết đơn hàng thành công',
  ORDER_IDS_IS_REQUIRED: 'Yêu cầu ID đơn hàng',
  ORDER_IDS_MUST_BE_AN_ARRAY: 'ID đơn hàng phải là một mảng',
  ORDER_IDS_IS_INVALID: 'ID đơn hàng không hợp lệ',
  ORDER_IDS_MUST_HAVE_AT_LEAST_ONE_ELEMENT: 'ID đơn hàng phải có ít nhất 1 phần tử'
} as const;

export const BLOGS_MESSAGES = {
  CREATE_BLOG_SUCCEED: 'Tạo blog thành công',
  THUMBNAIL_IS_REQUIRED: 'Yêu cầu hình thu nhỏ',
  THUMBNAIL_MUST_BE_A_STRING: 'Hình thu nhỏ phải là một chuỗi',
  NAME_IS_REQUIRED: 'Yêu cầu tên',
  NAME_MUST_BE_A_STRING: 'Tên phải là một chuỗi',
  CONTENT_IS_REQUIRED: 'Yêu cầu nội dung',
  CONTENT_MUST_BE_A_STRING: 'Nội dung phải là một chuỗi',
  STATUS_IS_REQUIRED: 'Yêu cầu trạng thái blog',
  STATUS_IS_INVALID: 'Trạng thái blog không hợp lệ',
  UPDATE_BLOG_SUCCEED: 'Cập nhật blog thành công',
  BLOG_ID_IS_REQUIRED: 'Yêu cầu ID blog',
  BLOG_ID_IS_INVALID: 'ID blog không hợp lệ',
  BLOG_NOT_FOUND: 'Không tìm thấy blog',
  DELETE_BLOG_SUCCEED: 'Xóa blog thành công',
  GET_BLOG_LIST_SUCCEED: 'Lấy danh sách blog thành công',
  GET_BLOG_DETAIL_SUCCEED: 'Lấy chi tiết blog thành công',
  BLOG_IDS_IS_REQUIRED: 'Yêu cầu ID blog',
  BLOG_IDS_MUST_BE_AN_ARRAY: 'ID blog phải là một mảng',
  BLOG_IDS_NOT_EMPTY: 'ID blog không được rỗng',
  BLOG_IDS_IS_INVALID: 'ID blog không hợp lệ'
} as const;

export const NOTIFICATIONS_MESSAGES = {
  NOTIFICATION_TYPE_IS_REQUIRED: 'Yêu cầu loại thông báo',
  NOTIFICATION_TYPE_IS_INVALID: 'Loại thông báo không hợp lệ',
  NOTIFICATION_TITLE_IS_REQUIRED: 'Yêu cầu tiêu đề thông báo',
  NOTIFICATION_TITLE_MUST_BE_A_STRING: 'Tiêu đề thông báo phải là một chuỗi',
  NOTIFICATION_CONTENT_IS_REQUIRED: 'Yêu cầu nội dung thông báo',
  NOTIFICATION_CONTENT_MUST_BE_A_STRING: 'Nội dung thông báo phải là một chuỗi',
  GET_NOTIFICATION_LIST_SUCCEED: 'Lấy danh sách thông báo thành công',
  NOTIFICATION_PATH_MUST_BE_A_STRING: 'Đường dẫn thông báo phải là một chuỗi',
  NOTIFICATION_PATH_IS_INVALID: 'Đường dẫn thông báo không hợp lệ',
  DELETE_NOTIFICATION_SUCCEED: 'Xóa thông báo thành công',
  NOTIFICATION_ID_IS_REQUIRED: 'Yêu cầu ID thông báo',
  NOTIFICATION_ID_IS_INVALID: 'ID thông báo không hợp lệ',
  NOTIFICATION_ID_IS_NOT_EXISTED: 'ID thông báo không tồn tại',
  MARK_AS_READ_NOTIFICATION_SUCCEED: 'Đánh dấu thông báo đã đọc thành công'
} as const;

export const CONVERSATIONS_MESSAGES = {
  CONTENT_REQUIRED: 'Nội dung cuộc trò chuyện là bắt buộc',
  RECEIVER_ID_IS_REQUIRED: 'Yêu cầu ID người nhận',
  RECEIVER_ID_IS_INVALID: 'ID người nhận không hợp lệ',
  RECEIVER_NOT_EXISTED: 'Người nhận không tồn tại',
  CONTENT_CANNOT_BE_EMPTY: 'Nội dung không thể để trống',
  RECEIVER_ID_MUST_BE_DIFFERENT_FROM_SENDER_ID: `Bạn không thể gửi tin nhắn cho chính mình`,
  GET_CONVERSATIONS_SUCCESS: 'Lấy danh sách cuộc trò chuyện thành công',
  READ_ALL_MESSAGES_SUCCESS: 'Đọc tất cả tin nhắn của cuộc trò chuyện thành công',
  SENDER_ID_IS_REQUIRED: 'Yêu cầu ID người gửi',
  SENDER_ID_IS_INVALID: 'ID người gửi không hợp lệ',
  SENDER_NOT_EXISTED: 'Người gửi không tồn tại',
  GET_RECEIVERS_SUCCESS: 'Lấy danh sách người nhận thành công'
} as const;
