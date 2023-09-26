import { Router } from 'express';

import {
  applyVoucherController,
  createVoucherController,
  deleteVouchersController,
  getVoucherByCodeController,
  getVoucherByIdController,
  getVouchersController,
  updateVoucherController,
  useVoucherController
} from '~/controllers/vouchers.controllers';
import { filterReqBodyMiddleware, paginationValidator } from '~/middlewares/common.middlewares';
import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import {
  applyVoucherValidator,
  createVoucherValidator,
  deleteVouchersValidator,
  getVouchersValidator,
  updateVoucherValidator,
  voucherCodeValidator,
  voucherIdValidator
} from '~/middlewares/vouchers.middlewares';
import { CreateVoucherRequestBody } from '~/models/requests/Voucher.requests';
import { wrapRequestHandler } from '~/utils/handler';

const vouchersRouter = Router();

// Thêm voucher
vouchersRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  createVoucherValidator,
  filterReqBodyMiddleware<CreateVoucherRequestBody>(['name', 'description', 'discount', 'discount_unit', 'code']),
  wrapRequestHandler(createVoucherController)
);

// Lấy danh sách voucher
vouchersRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  paginationValidator,
  getVouchersValidator,
  wrapRequestHandler(getVouchersController)
);

// Lấy 1 voucher theo voucher_code
vouchersRouter.get(
  '/code/:voucher_code',
  accessTokenValidator,
  verifiedUserValidator,
  voucherCodeValidator,
  wrapRequestHandler(getVoucherByCodeController)
);

// Lấy 1 voucher theo voucher_id
vouchersRouter.get(
  '/:voucher_id',
  accessTokenValidator,
  verifiedUserValidator,
  voucherIdValidator,
  wrapRequestHandler(getVoucherByIdController)
);

// Cập nhật voucher
vouchersRouter.put(
  '/:voucher_id',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  voucherIdValidator,
  updateVoucherValidator,
  wrapRequestHandler(updateVoucherController)
);

// Xóa voucher
vouchersRouter.delete(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  deleteVouchersValidator,
  wrapRequestHandler(deleteVouchersController)
);

// Áp dụng voucher
vouchersRouter.post(
  '/apply',
  accessTokenValidator,
  verifiedUserValidator,
  applyVoucherValidator,
  wrapRequestHandler(applyVoucherController)
);

// Sử dụng voucher
vouchersRouter.patch(
  '/use/code/:voucher_code',
  accessTokenValidator,
  verifiedUserValidator,
  voucherCodeValidator,
  wrapRequestHandler(useVoucherController)
);

export default vouchersRouter;
