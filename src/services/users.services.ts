import { config } from 'dotenv';
import { ObjectId, WithId } from 'mongodb';

import User from '~/models/schemas/User.schema';
import databaseService from './database.services';
import { USERS_MESSAGES } from '~/constants/messages';
import { hashPassword } from '~/utils/crypto';
import { TokenType, UserRole, UserVerifyStatus } from '~/constants/enum';
import { signToken } from '~/utils/jwt';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import { USERS_PROJECTION } from '~/constants/db';
import { AddAddressRequestBody, UpdateAddressRequestBody, UpdateMeRequestBody } from '~/models/requests/User.requests';
import { Address } from '~/models/schemas/User.schema';
config();

interface SignToken {
  user_id: string;
  verify: UserVerifyStatus;
}

class UserService {
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    return {
      isExist: Boolean(user),
      user
    };
  }

  async signAccessToken({ user_id, verify }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.Access
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  async signRefreshToken({ user_id, verify }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.Refresh
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  async signAccessAndRefreshToken({ user_id, verify }: SignToken) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })]);
  }

  async signEmailVerifyToken({ user_id, verify }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.EmailVerify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.VERIFY_EMAIL_TOKEN_EXPIRES_IN
      }
    });
  }

  async signForgotPasswordToken({ user_id, verify }: SignToken) {
    return signToken({
      payload: {
        user_id,
        verify,
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
        verify: UserVerifyStatus.Unverified
      }),
      this.signEmailVerifyToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
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

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });
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
    refresh_token
  }: {
    user_id: string;
    verify: UserVerifyStatus;
    refresh_token: string;
  }) {
    const [[access_token, new_refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify }),
      databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    ]);
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({ token: new_refresh_token, user_id: new ObjectId(user_id) })
    );
    console.log(access_token, new_refresh_token);

    return {
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCEED,
      data: {
        access_token,
        refresh_token: new_refresh_token
      }
    };
  }

  async verifyEmail(user_id: string) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
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

  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified });
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
    const { _id, verify } = user as WithId<User>;
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id: _id.toString(),
      verify
    });
    await databaseService.users.updateOne({ _id }, { $set: { forgot_password_token } });
    console.log('>>> Gửi email khôi phục mật khẩu: ', forgot_password_token);
    return {
      message: USERS_MESSAGES.SEND_FORGOT_PASSWORD_EMAIL_SUCCESS
    };
  }

  async resetPassword({ password, user_id, verify }: { password: string; user_id: string; verify: UserVerifyStatus }) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify }),
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
}

const userService = new UserService();
export default userService;
