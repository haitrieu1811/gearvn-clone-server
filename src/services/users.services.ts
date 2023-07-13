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
config();

interface SignToken {
  user_id: string;
  verify: UserVerifyStatus;
  role: UserRole;
}

class UserService {
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    return {
      isExist: Boolean(user),
      user
    };
  }

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

  async signAccessAndRefreshToken({ user_id, verify, role }: SignToken) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, role })
    ]);
  }

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

  async insertRefreshToken({ token, user_id }: { token: string; user_id: string }) {
    return databaseService.refresh_tokens.insertOne(new RefreshToken({ token, user_id: new ObjectId(user_id) }));
  }

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

  async login({ user_id, verify, role }: { user_id: string; verify: UserVerifyStatus; role: UserRole }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify, role });
    await this.insertRefreshToken({ token: refresh_token, user_id });
    return {
      access_token,
      refresh_token
    };
  }

  async logout(refresh_token: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token });
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCEED
    };
  }

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

  async updateMe({ payload, user_id }: { payload: UpdateMeRequestBody; user_id: string }) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload;
    const user = await databaseService.users.findOneAndUpdate(
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
    return {
      message: USERS_MESSAGES.UPDATE_PROFILE_SUCCEED,
      data: {
        user: user.value
      }
    };
  }

  async addAddress({ payload, user_id }: { payload: AddAddressRequestBody; user_id: string }) {
    await databaseService.users.updateOne(
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
      }
    );
    return {
      message: USERS_MESSAGES.ADD_ADDRESS_SUCCEED
    };
  }

  async updateAddress({
    payload,
    address_id,
    user_id
  }: {
    payload: UpdateAddressRequestBody;
    address_id: string;
    user_id: string;
  }) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
        'addresses._id': new ObjectId(address_id)
      },
      {
        $set: {
          'addresses.$': {
            _id: new ObjectId(address_id),
            ...payload
          }
        }
      }
    );
    return {
      message: USERS_MESSAGES.UPDATE_ADDRESS_SUCCEED
    };
  }

  async deleteAddress({ address_id, user_id }: { address_id: string; user_id: string }) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $pull: {
          addresses: {
            _id: new ObjectId(address_id)
          }
        }
      }
    );
    return {
      message: USERS_MESSAGES.DELETE_ADDRESS_SUCCEED
    };
  }

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
}

const userService = new UserService();
export default userService;
