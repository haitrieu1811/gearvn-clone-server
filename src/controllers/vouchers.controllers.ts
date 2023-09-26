import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';

import { TokenPayload } from '~/models/requests/User.requests';
import {
  ApplyVoucherRequestBody,
  CreateVoucherRequestBody,
  DeleteVouchersRequestBody,
  VoucherCodeRequestParams,
  VoucherIdRequestParams
} from '~/models/requests/Voucher.requests';
import vouchersService from '~/services/vouchers.services';

// Thêm voucher
export const createVoucherController = async (
  req: Request<ParamsDictionary, any, CreateVoucherRequestBody>,
  res: Response
) => {
  const { body } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await vouchersService.createVoucher({ body, user_id });
  return res.json(result);
};

// Lấy danh sách voucher
export const getVouchersController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await vouchersService.getVouchers(query);
  return res.json(result);
};

// Lấy 1 voucher theo voucher_code
export const getVoucherByCodeController = async (req: Request<VoucherCodeRequestParams>, res: Response) => {
  const { voucher_code } = req.params;
  const result = await vouchersService.getVoucher({ voucher_code });
  return res.json(result);
};

// Lấy 1 voucher theo voucher_id
export const getVoucherByIdController = async (req: Request<VoucherIdRequestParams>, res: Response) => {
  const { voucher_id } = req.params;
  const result = await vouchersService.getVoucher({ voucher_id });
  return res.json(result);
};

// Cập nhật Voucher
export const updateVoucherController = async (req: Request<VoucherIdRequestParams>, res: Response) => {
  const { voucher_id } = req.params;
  const { body } = req;
  const result = await vouchersService.updateVoucher({ voucher_id, body });
  return res.json(result);
};

// Xóa vouchers (có thể xóa nhiều voucher cùng lúc)
export const deleteVouchersController = async (
  req: Request<ParamsDictionary, any, DeleteVouchersRequestBody>,
  res: Response
) => {
  const { voucher_ids } = req.body;
  console.log(voucher_ids);

  const result = await vouchersService.deleteVouchers(voucher_ids);
  return res.json(result);
};

export const applyVoucherController = async (
  req: Request<ParamsDictionary, any, ApplyVoucherRequestBody>,
  res: Response
) => {
  const { voucher_code, original_price } = req.body;
  const result = await vouchersService.applyVoucher({ voucher_code, original_price });
  return res.json(result);
};

// Sử dụng voucher
export const useVoucherController = async (req: Request<VoucherCodeRequestParams>, res: Response) => {
  const { voucher_code } = req.params;
  const result = await vouchersService.useVoucher(voucher_code);
  return res.json(result);
};
