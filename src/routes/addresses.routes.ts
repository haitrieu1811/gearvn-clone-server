import { Router } from 'express';

import {
  addAddressController,
  deleteAddressController,
  getAddressController,
  getAddressesController,
  setDefaultAddressController,
  updateAddressController
} from '~/controllers/addresses.controllers';
import {
  addAddressValidator,
  addressExistValidator,
  notDefaultAddressValidator,
  updateAddressValidator
} from '~/middlewares/addresses.middlewares';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { AddAddressRequestBody, UpdateAddressRequestBody } from '~/models/requests/Address.requests';
import { wrapRequestHandler } from '~/utils/handler';

const addressesRouter = Router();

// Tạo mới một địa chỉ cho tài khoản
addressesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  addAddressValidator,
  filterReqBodyMiddleware<AddAddressRequestBody>(['province', 'district', 'ward', 'street', 'type']),
  wrapRequestHandler(addAddressController)
);

// Lấy danh sách tất cả địa chỉ của tài khoản
addressesRouter.get('/', accessTokenValidator, wrapRequestHandler(getAddressesController));

// Lấy thông tin chi tiết một địa chỉ của tài khoản
addressesRouter.get(
  '/:address_id',
  accessTokenValidator,
  addressExistValidator,
  wrapRequestHandler(getAddressController)
);

// Cập nhật thông tin một địa chỉ của tài khoản
addressesRouter.put(
  '/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  updateAddressValidator,
  filterReqBodyMiddleware<UpdateAddressRequestBody>(['province', 'district', 'ward', 'street', 'type', 'is_default']),
  wrapRequestHandler(updateAddressController)
);

// Xóa một địa chỉ của tài khoản
addressesRouter.delete(
  '/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  notDefaultAddressValidator,
  wrapRequestHandler(deleteAddressController)
);

// Đặt một địa chỉ thành địa chỉ mặc định
addressesRouter.put(
  '/set-default/:address_id',
  accessTokenValidator,
  verifiedUserValidator,
  addressExistValidator,
  wrapRequestHandler(setDefaultAddressController)
);

export default addressesRouter;
