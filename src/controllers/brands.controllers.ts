import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { BrandIdRequestParams, CreateBrandRequestBody, DeleteBrandRequestBody } from '~/models/requests/Brand.requests';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import brandsService from '~/services/brands.services';

// Lấy danh sách nhãn hiệu
export const getBrandsController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { query } = req;
  const result = await brandsService.getBrands(query);
  return res.json(result);
};

// Lấy thông tin chi tiết nhãn hiệu
export const getBrandController = async (req: Request<BrandIdRequestParams>, res: Response) => {
  const { brand_id } = req.params;
  const result = await brandsService.getBrand(brand_id);
  return res.json(result);
};

// Tạo mới nhãn hiệu
export const createBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandRequestBody>,
  res: Response
) => {
  const { name } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await brandsService.createBrand({ name, user_id });
  return res.json(result);
};

// Cập nhật nhãn hiệu
export const updateBrandController = async (
  req: Request<BrandIdRequestParams, any, CreateBrandRequestBody>,
  res: Response
) => {
  const { brand_id } = req.params;
  const { name } = req.body;
  const result = await brandsService.updateBrand({ name, brand_id });
  return res.json(result);
};

// Xóa nhãn hiệu
export const deleteBrandController = async (
  req: Request<ParamsDictionary, any, DeleteBrandRequestBody>,
  res: Response
) => {
  const { brand_ids } = req.body;
  const result = await brandsService.deleteBrand(brand_ids);
  return res.json(result);
};
