import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  AddAddressRequestBody,
  DeleteAddressRequestParams,
  GetAddressRequestParams,
  SetDefaultAddressRequestParams,
  UpdateAddressRequestBody,
  UpdateAddressRequestParams
} from '~/models/requests/Address.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import addressesService from '~/services/addresses.services';

// Thêm địa chỉ nhận hàng
export const addAddressController = async (
  req: Request<ParamsDictionary, any, AddAddressRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body: payload } = req;
  const result = await addressesService.addAddress({ payload, user_id });
  return res.json(result);
};

// Lấy danh sách tất cả địa chỉ của người dùng
export const getAddressesController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await addressesService.getAddresses(user_id);
  return res.json(result);
};

// Lấy thông tin địa chỉ nhận hàng
export const getAddressController = async (req: Request<GetAddressRequestParams>, res: Response) => {
  const { address_id } = req.params;
  const result = await addressesService.getAddress(address_id);
  return res.json(result);
};

// Cập nhật địa chỉ nhận hàng
export const updateAddressController = async (
  req: Request<UpdateAddressRequestParams, any, UpdateAddressRequestBody>,
  res: Response
) => {
  const { body: payload } = req;
  const { address_id } = req.params;
  const result = await addressesService.updateAddress({ payload, address_id });
  return res.json(result);
};

// Xóa địa chỉ nhận hàng
export const deleteAddressController = async (req: Request<DeleteAddressRequestParams, any, any>, res: Response) => {
  const { address_id } = req.params;
  const result = await addressesService.deleteAddress(address_id);
  return res.json(result);
};

// Đặt thành địa chỉ mặc định
export const setDefaultAddressController = async (req: Request<SetDefaultAddressRequestParams>, res: Response) => {
  const { address_id } = req.params;
  const result = await addressesService.setDefaultAddress(address_id);
  return res.json(result);
};
