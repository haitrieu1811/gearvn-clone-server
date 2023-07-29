import { config } from 'dotenv';
import { ObjectId, WithId } from 'mongodb';
import pick from 'lodash/pick';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import isNaN from 'lodash/isNaN';

import { USERS_PROJECTION } from '~/constants/db';
import { Gender, TokenType, UserRole, UserVerifyStatus } from '~/constants/enum';
import { USERS_MESSAGES } from '~/constants/messages';
import {
  AddAddressRequestBody,
  GetUsersRequestQuery,
  UpdateAddressRequestBody,
  UpdateMeRequestBody
} from '~/models/requests/User.requests';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import User from '~/models/schemas/User.schema';
import { hashPassword } from '~/utils/crypto';
import { signToken } from '~/utils/jwt';
import databaseService from './database.services';
import ViewedProduct from '~/models/schemas/ViewedProduct.schema';
config();

interface SignToken {
  user_id: string;
  verify: UserVerifyStatus;
  role: UserRole;
}

class UserService {
  // Kiểm tra email đã tồn tại chưa
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    return {
      isExist: Boolean(user),
      user
    };
  }

  // Tạo access token
  async signAccessToken({ user_id, verify, role }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        token_type: TokenType.Access
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  // Tạo refresh token
  async signRefreshToken({ user_id, verify, role }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        token_type: TokenType.Refresh
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  // Tạo access và refresh token
  async signAccessAndRefreshToken({ user_id, verify, role }: SignToken) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, role })
    ]);
  }

  // Tạo token xác thực email
  async signEmailVerifyToken({ user_id, verify, role }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        token_type: TokenType.EmailVerify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.VERIFY_EMAIL_TOKEN_EXPIRES_IN
      }
    });
  }

  // Tạo token quên mật khẩu
  async signForgotPasswordToken({ user_id, verify, role }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        token_type: TokenType.ForgotPassword
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    });
  }

  // Thêm 1 refresh token vào database
  async insertRefreshToken({ token, user_id }: { token: string; user_id: string }) {
    return databaseService.refresh_tokens.insertOne(new RefreshToken({ token, user_id: new ObjectId(user_id) }));
  }

  // Đăng ký
  async register({ email, password }: { email: string; password: string }) {
    // Tạo user_id
    const user_id = new ObjectId();
    // Tạo access_token, refresh_token và email_verify_token
    const [[access_token, refresh_token], email_verify_token] = await Promise.all([
      this.signAccessAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified,
        role: UserRole.Customer
      }),
      this.signEmailVerifyToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified,
        role: UserRole.Customer
      })
    ]);
    // Thêm user vào collection
    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        email,
        password: hashPassword(password),
        email_verify_token
      })
    );
    // Lấy thông tin user mới thêm và insert một refresh_token mới vào collection refresh_tokens
    const [insertedUser] = await Promise.all([
      databaseService.users.findOne(
        {
          _id: user_id
        },
        {
          projection: USERS_PROJECTION
        }
      ),
      this.insertRefreshToken({ token: refresh_token, user_id: user_id.toString() })
    ]);
    // Gửi mail
    console.log('>>> Send mail: ', email_verify_token);
    return {
      message: USERS_MESSAGES.REGISTER_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user: insertedUser
      }
    };
  }

  // Đăng nhập
  async login({ user_id, verify, role }: { user_id: string; verify: UserVerifyStatus; role: UserRole }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify, role });
    await this.insertRefreshToken({ token: refresh_token, user_id });
    return {
      access_token,
      refresh_token
    };
  }

  // Đăng xuất
  async logout(refresh_token: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token });
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCEED
    };
  }

  // Thực hiện refresh token
  async refreshToken({
    user_id,
    verify,
    role,
    refresh_token
  }: {
    user_id: string;
    verify: UserVerifyStatus;
    role: UserRole;
    refresh_token: string;
  }) {
    const [[access_token, new_refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify, role }),
      databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    ]);
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({ token: new_refresh_token, user_id: new ObjectId(user_id) })
    );
    return {
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCEED,
      data: {
        access_token,
        refresh_token: new_refresh_token
      }
    };
  }

  // Xác thực email
  async verifyEmail({ user_id, role }: { user_id: string; role: UserRole }) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified, role }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ]);
    await this.insertRefreshToken({ token: refresh_token, user_id });
    return {
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCEED,
      data: {
        access_token,
        refresh_token
      }
    };
  }

  // Gửi lại email xác thực
  async resendEmailVerify({ user_id, role }: { user_id: string; role: UserRole }) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified, role });
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    console.log('>>> Send email to user: ', email_verify_token);
    return {
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCEED
    };
  }

  // Quên mật khẩu
  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email });
    const { _id, verify, role } = user as WithId<User>;
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id: _id.toString(),
      verify,
      role
    });
    await databaseService.users.updateOne({ _id }, { $set: { forgot_password_token } });
    console.log('>>> Gửi email khôi phục mật khẩu: ', forgot_password_token);
    return {
      message: USERS_MESSAGES.SEND_FORGOT_PASSWORD_EMAIL_SUCCESS
    };
  }

  // Đặt lại mật khẩu
  async resetPassword({
    password,
    user_id,
    verify,
    role
  }: {
    password: string;
    user_id: string;
    verify: UserVerifyStatus;
    role: UserRole;
  }) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify, role }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: ''
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ]);
    await this.insertRefreshToken({ token: refresh_token, user_id });
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCEED,
      data: {
        access_token,
        refresh_token
      }
    };
  }

  // Đổi mật khẩu
  async changePassword({ password, user_id }: { password: string; user_id: string }) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCEED
    };
  }

  // Lấy thông tin tài khoản đăng nhập
  async getMe(user_id: string) {
    const me = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: USERS_PROJECTION
      }
    );
    return {
      message: USERS_MESSAGES.GET_ME_SUCCEED,
      data: {
        user: me
      }
    };
  }

  // Cập nhật thông tin tài khoản đăng nhập
  async updateMe({ payload, user_id }: { payload: UpdateMeRequestBody; user_id: string }) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload;
    const { value: user } = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: USERS_PROJECTION
      }
    );
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user?._id.toString() as string,
      role: user?.role as UserRole,
      verify: user?.verify as UserVerifyStatus
    });
    return {
      message: USERS_MESSAGES.UPDATE_PROFILE_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user
      }
    };
  }

  // Thêm địa chỉ nhận hàng
  async addAddress({ payload, user_id }: { payload: AddAddressRequestBody; user_id: string }) {
    const { value: user } = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $push: {
          addresses: {
            _id: new ObjectId(),
            ...payload
          }
        }
      },
      {
        returnDocument: 'after',
        projection: USERS_PROJECTION
      }
    );
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user?._id.toString() as string,
      role: user?.role as UserRole,
      verify: user?.verify as UserVerifyStatus
    });
    return {
      message: USERS_MESSAGES.ADD_ADDRESS_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user
      }
    };
  }

  // Lấy thông tin địa chỉ nhận hàng
  async getAddress(address_id: string) {
    const user = await databaseService.users.findOne({
      'addresses._id': new ObjectId(address_id)
    });
    const address = user?.addresses.find((address) => address._id.toString() === address_id);
    return {
      message: USERS_MESSAGES.GET_ADDRESS_SUCCEED,
      data: {
        address
      }
    };
  }

  // Cập nhật địa chỉ nhận hàng
  async updateAddress({ payload, address_id }: { payload: UpdateAddressRequestBody; address_id: string }) {
    const { value: user } = await databaseService.users.findOneAndUpdate(
      {
        'addresses._id': new ObjectId(address_id)
      },
      {
        $set: {
          'addresses.$': {
            _id: new ObjectId(address_id),
            ...payload
          }
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: USERS_PROJECTION,
        returnDocument: 'after'
      }
    );
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user?._id.toString() as string,
      role: user?.role as UserRole,
      verify: user?.verify as UserVerifyStatus
    });
    return {
      message: USERS_MESSAGES.UPDATE_ADDRESS_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user
      }
    };
  }

  // Xóa địa chỉ nhận hàng
  async deleteAddress(address_id: string) {
    const { value: user } = await databaseService.users.findOneAndUpdate(
      {
        // _id: new ObjectId(user_id)
        'addresses._id': new ObjectId(address_id)
      },
      {
        $pull: {
          addresses: {
            _id: new ObjectId(address_id)
          }
        }
      },
      {
        returnDocument: 'after',
        projection: USERS_PROJECTION
      }
    );
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user?._id.toString() as string,
      role: user?.role as UserRole,
      verify: user?.verify as UserVerifyStatus
    });
    return {
      message: USERS_MESSAGES.DELETE_ADDRESS_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user
      }
    };
  }

  // Đặt địa chỉ thành mặc định
  async setDefaultAddress({ address_id, user_id }: { address_id: string; user_id: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    });
    const _addresses = user?.addresses.map((address) => {
      if (address._id.toString() === address_id) {
        return {
          ...address,
          isDefault: true
        };
      }
      return {
        ...address,
        isDefault: false
      };
    });
    const { value: _user } = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          addresses: _addresses
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: USERS_PROJECTION
      }
    );
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: _user?._id.toString() as string,
      role: _user?.role as UserRole,
      verify: _user?.verify as UserVerifyStatus
    });
    return {
      message: USERS_MESSAGES.SET_DEFAULT_ADDRESS_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user: _user
      }
    };
  }

  // Cập nhật quyền tài khoản
  async updateRoles({ role, user_id }: { role: UserRole; user_id: string }) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          role
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: USERS_MESSAGES.UPDATE_ROLE_SUCCEED
    };
  }

  // Lấy danh sách tài khoản người dùng
  async getUsers({ user_id, query }: { user_id: string; query: GetUsersRequestQuery }) {
    const { page, limit, gender, role, status } = query;
    const queryConfig = omitBy(
      {
        gender: Number(gender),
        status: Number(status),
        role: Number(role)
      },
      isNaN
    );
    const _limit = Number(limit) || 10;
    const _page = Number(page) || 1;
    const skip = (_page - 1) * _limit;
    const [total, users] = await Promise.all([
      databaseService.users.countDocuments({
        _id: {
          $not: { $eq: new ObjectId(user_id) }
        }
      }),
      databaseService.users
        .find(
          {
            _id: {
              $ne: new ObjectId(user_id)
            },
            ...queryConfig
          },
          {
            projection: USERS_PROJECTION
          }
        )
        .skip(skip)
        .limit(_limit)
        .toArray()
    ]);
    const pageSize = Math.ceil(total / _limit);
    return {
      message: USERS_MESSAGES.GET_USERS_LIST_SUCCEED,
      data: {
        users,
        pagination: {
          total: users.length,
          page: _page,
          limit: _limit,
          page_size: pageSize
        }
      }
    };
  }

  // Xóa tài khoản
  async deleteUser(user_ids: ObjectId[]) {
    const _user_ids = user_ids.map((id) => new ObjectId(id));
    const { deletedCount } = await databaseService.users.deleteMany({
      _id: {
        $in: _user_ids
      }
    });
    return {
      message: `Delete ${deletedCount} user succeed`
    };
  }

  // Thêm một lịch sử xem sản phẩm
  async addViewedProduct({ product_id, user_id }: { product_id: string; user_id: string }) {
    const viewedProduct = await databaseService.viewedProducts.findOne({
      product_id: new ObjectId(product_id),
      user_id: new ObjectId(user_id)
    });
    if (!viewedProduct) {
      await databaseService.viewedProducts.insertOne(
        new ViewedProduct({
          product_id: new ObjectId(product_id),
          user_id: new ObjectId(user_id)
        })
      );
    } else {
      await databaseService.viewedProducts.updateOne(
        {
          product_id: new ObjectId(product_id),
          user_id: new ObjectId(user_id)
        },
        {
          $currentDate: {
            updated_at: true
          }
        }
      );
    }
    return {
      message: USERS_MESSAGES.ADD_OR_UPDATE_VIEWED_PRODUCT_SUCCEED
    };
  }

  // Lấy danh sách sản phẩm đã xem
  async getViewedProducts(user_id: string) {
    const viewed_products = await databaseService.viewedProducts
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $group: {
            _id: '$_id',
            product: { $first: '$product' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' }
          }
        },
        {
          $project: {
            'product.general_info': 0,
            'product.description': 0,
            'product.images': 0,
            'product.brand_id': 0,
            'product.category_id': 0,
            'product.specifications': 0,
            'product.user_id': 0
          }
        },
        {
          $sort: {
            updated_at: -1
          }
        }
      ])
      .limit(12)
      .toArray();
    return {
      message: USERS_MESSAGES.GET_VIEWED_PRODUCTS_SUCCEED,
      data: {
        viewed_products
      }
    };
  }
}

const userService = new UserService();
export default userService;
