import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';

import {
  AddAddressRequestBody,
  ChangePasswordRequestBody,
  DeleteAddressRequestParams,
  DeleteUserRequestBody,
  ForgotPasswordRequestBody,
  GetUsersRequestQuery,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UpdateAddressRequestBody,
  UpdateAddressRequestParams,
  UpdateMeRequestBody,
  UpdateRolesRequestBody,
  VerifyEmailRequestBody
} from '~/models/requests/User.requests';
import User from '~/models/schemas/User.schema';
import databaseService from '~/services/database.services';
import productService from '~/services/products.services';
import userService from '~/services/users.services';

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const { email, password } = req.body;
  const result = await userService.register({ email, password });
  return res.json(result);
};

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const user = req.user as User;
  const { _id, verify, role } = user;
  const result = await userService.login({ user_id: _id?.toString() as string, verify, role });
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCEED,
    data: {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user
    }
  });
};

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body;
  const result = await userService.logout(refresh_token);
  return res.json(result);
};

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { user_id, verify, role } = req.decoded_refresh_token as TokenPayload;
  const { refresh_token } = req.body;
  const result = await userService.refreshToken({ user_id, verify, refresh_token, role });
  return res.json(result);
};

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_email_verify_token as TokenPayload;
  const result = await userService.verifyEmail({ user_id, role });
  return res.json(result);
};

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    });
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_VERIFY_BEFORE
    });
  }
  const result = await userService.resendEmailVerify({ user_id, role });
  return res.json(result);
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { email } = req.body;
  const result = await userService.forgotPassword(email);
  return res.json(result);
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { user_id, verify, role } = req.decoded_forgot_password_token as TokenPayload;
  const { password } = req.body;
  const result = await userService.resetPassword({ password, user_id, verify, role });
  return res.json(result);
};

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>,
  res: Response
) => {
  const { password } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await userService.changePassword({ password, user_id });
  return res.json(result);
};

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await userService.getMe(user_id);
  return res.json(result);
};

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeRequestBody>, res: Response) => {
  const payload = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const rssult = await userService.updateMe({ payload, user_id });
  return res.json(rssult);
};

export const addAddressController = async (
  req: Request<ParamsDictionary, any, AddAddressRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body: payload } = req;
  const result = await userService.addAddress({ payload, user_id });
  return res.json(result);
};

export const updateAddressController = async (
  req: Request<UpdateAddressRequestParams, any, UpdateAddressRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { address_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await userService.updateAddress({ payload, address_id, user_id });
  return res.json(result);
};

export const deleteAddressController = async (req: Request<DeleteAddressRequestParams, any, any>, res: Response) => {
  const { address_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await userService.deleteAddress({ address_id, user_id });
  return res.json(result);
};

export const updateRolesController = async (
  req: Request<ParamsDictionary, any, UpdateRolesRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { role } = req.body;
  const result = await userService.updateRoles({ role, user_id });
  return res.json(result);
};

export const getUsersController = async (
  req: Request<ParamsDictionary, any, any, GetUsersRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { query } = req;
  const result = await userService.getUsers({ user_id, query });
  return res.json(result);
};

export const deleteUserController = async (
  req: Request<ParamsDictionary, any, DeleteUserRequestBody>,
  res: Response
) => {
  const { user_ids } = req.body;
  const result = await userService.deleteUser(user_ids);
  return res.json(result);
};
