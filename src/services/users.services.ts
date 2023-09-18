import { config } from 'dotenv';
import isNaN from 'lodash/isNaN';
import omitBy from 'lodash/omitBy';
import { ObjectId, WithId } from 'mongodb';

import { ENV_CONFIG } from '~/constants/config';
import { TokenType, UserRole, UserVerifyStatus } from '~/constants/enum';
import { USERS_MESSAGES } from '~/constants/messages';
import { GetUsersRequestQuery, UpdateMeRequestBody } from '~/models/requests/User.requests';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import User from '~/models/schemas/User.schema';
import ViewedProduct from '~/models/schemas/ViewedProduct.schema';
import { hashPassword } from '~/utils/crypto';
import { sendForgotPasswordEmail, sendVerifyEmail } from '~/utils/email';
import { signToken, verifyToken } from '~/utils/jwt';
import databaseService from './database.services';
config();

interface SignToken {
  user_id: string;
  verify: UserVerifyStatus;
  role: UserRole;
  exp?: number;
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
      privateKey: ENV_CONFIG.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  // Tạo refresh token
  async signRefreshToken({ user_id, verify, role, exp }: SignToken) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          verify,
          role,
          token_type: TokenType.Refresh,
          exp
        },
        privateKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN as string
      });
    }
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        token_type: TokenType.Refresh
      },
      privateKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  // Tạo access và refresh token
  async signAccessAndRefreshToken({ user_id, verify, role, exp }: SignToken) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, role, exp })
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
      privateKey: ENV_CONFIG.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.VERIFY_EMAIL_TOKEN_EXPIRES_IN
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
      privateKey: ENV_CONFIG.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    });
  }

  // Thêm 1 refresh token vào database
  async insertRefreshToken({ token, user_id, iat, exp }: { token: string; user_id: string; iat: number; exp: number }) {
    return databaseService.refresh_tokens.insertOne(
      new RefreshToken({ token, user_id: new ObjectId(user_id), iat, exp })
    );
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
        fullname: `User#${user_id.toString().slice(-4)}`, // Tạo tên mặc định khi mới tạo tài khoản
        email,
        password: hashPassword(password),
        email_verify_token
      })
    );
    // Lấy thông tin user mới thêm và insert một refresh_token mới vào collection refresh_tokens
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    const [insertedUser] = await Promise.all([
      databaseService.users.findOne(
        {
          _id: user_id
        },
        {
          projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            addresses: 0
          }
        }
      ),
      this.insertRefreshToken({
        token: refresh_token,
        user_id: user_id.toString(),
        iat,
        exp
      })
    ]);
    // Gửi mail
    await sendVerifyEmail(email, email_verify_token);
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
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    await this.insertRefreshToken({
      token: refresh_token,
      user_id,
      iat,
      exp
    });
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

  // Giải mã token
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN as string
    });
  }

  // Thực hiện refresh token
  async refreshToken({
    user_id,
    verify,
    role,
    refresh_token,
    exp
  }: {
    user_id: string;
    verify: UserVerifyStatus;
    role: UserRole;
    refresh_token: string;
    exp: number;
  }) {
    // Tạo 1 access_token, 1 refresh_token mới và xóa đi 1 refresh_token cũ trong DB
    const [[new_access_token, new_refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify, role, exp }),
      databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    ]);
    // Giải mã để lấy thời gian hết hạn của token
    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token);
    await this.insertRefreshToken({
      token: new_refresh_token,
      user_id,
      iat: decoded_refresh_token.iat,
      exp: decoded_refresh_token.exp
    });
    return {
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCEED,
      data: {
        access_token: new_access_token,
        refresh_token: new_refresh_token
      }
    };
  }

  // Xác thực email
  async verifyEmail({ user_id, role }: { user_id: string; role: UserRole }) {
    const [[access_token, refresh_token], { value: updated_user }] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified, role }),
      databaseService.users.findOneAndUpdate(
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
        },
        {
          returnDocument: 'after',
          projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            addresses: 0
          }
        }
      )
    ]);
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    await this.insertRefreshToken({
      token: refresh_token,
      user_id,
      iat,
      exp
    });
    return {
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user: updated_user
      }
    };
  }

  // Gửi lại email xác thực
  async resendEmailVerify({ user_id, role, email }: { user_id: string; role: UserRole; email: string }) {
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
    await sendVerifyEmail(email, email_verify_token);
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
    await sendForgotPasswordEmail(email, forgot_password_token);
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
    const [[access_token, refresh_token], { value: updated_user }] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify, role }),
      databaseService.users.findOneAndUpdate(
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
        },
        {
          returnDocument: 'after',
          projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            addresses: 0
          }
        }
      )
    ]);
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    await this.insertRefreshToken({
      token: refresh_token,
      user_id,
      iat,
      exp
    });
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user: updated_user
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
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          addresses: 0
        }
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
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          addresses: 0
        }
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
            projection: {
              password: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              addresses: 0
            }
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

  // Lấy số lượng của mỗi collection
  async getQuantityPerCollection() {
    const [users, products, orders, categories, brands, blogs] = await Promise.all([
      databaseService.users.countDocuments(),
      databaseService.products.countDocuments(),
      databaseService.orders.countDocuments(),
      databaseService.categories.countDocuments(),
      databaseService.brands.countDocuments(),
      databaseService.blogs.countDocuments()
    ]);
    return {
      message: USERS_MESSAGES.GET_QUANTITY_PER_COLLECTION_SUCCEED,
      data: {
        users,
        products,
        orders,
        categories,
        brands,
        blogs
      }
    };
  }

  // Lấy danh sách id của những tài khoản admin (chỉ sử dụng ở server)
  async getAdminIds() {
    const admin_ids = await databaseService.users
      .find(
        {
          role: UserRole.Admin
        },
        {
          projection: {
            _id: 1
          }
        }
      )
      .toArray();
    return admin_ids.map((admin) => admin._id);
  }
}

const userService = new UserService();
export default userService;
