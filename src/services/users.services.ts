import { config } from 'dotenv';
import { ObjectId } from 'mongodb';

import User from '~/models/schemas/User.schema';
import databaseService from './database.services';
import { USERS_MESSAGES } from '~/constants/messages';
import { hashPassword } from '~/utils/crypto';
import { TokenType, UserVerifyStatus } from '~/constants/enum';
import { signToken } from '~/utils/jwt';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import { USERS_PROJECTION } from '~/constants/db';
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

  insertRefreshToken({ token, user_id }: { token: string; user_id: string }) {
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
    return {
      message: USERS_MESSAGES.REGISTER_SUCCEED,
      data: {
        access_token,
        refresh_token,
        user: insertedUser
      }
    };
  }

  async login({ user_id, verify }: SignToken) {
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

  async verifyEmail({ user_id, verify }: SignToken) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify }),
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
}

const userService = new UserService();
export default userService;
