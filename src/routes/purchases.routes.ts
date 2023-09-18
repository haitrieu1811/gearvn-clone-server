import { Router } from 'express';

import {
  addToCartController,
  checkoutController,
  deleteAllPurchaseController,
  deletePurchaseController,
  getCartListController,
  updatePurchaseController
} from '~/controllers/purchases.controllers';
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares';
import {
  addToCartValidator,
  checkPurchaseExist,
  checkoutValidator,
  deletePurchaseValidator,
  updatePurchaseValidator
} from '~/middlewares/purchases.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { CheckoutRequestBody } from '~/models/requests/Purchase.requests';
import { wrapRequestHandler } from '~/utils/handler';

const purchasesRouter = Router();

// Thêm vào giỏ hàng
purchasesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  addToCartValidator,
  wrapRequestHandler(addToCartController)
);

// Lấy danh sách giỏ hàng
purchasesRouter.get('/', accessTokenValidator, wrapRequestHandler(getCartListController));

// Cập nhật giỏ hàng
purchasesRouter.put(
  '/:purchase_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkPurchaseExist,
  updatePurchaseValidator,
  wrapRequestHandler(updatePurchaseController)
);

// Xóa giỏ hàng
purchasesRouter.delete(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  deletePurchaseValidator,
  wrapRequestHandler(deletePurchaseController)
);

// Xóa tất cả giỏ hàng
purchasesRouter.delete(
  '/all',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(deleteAllPurchaseController)
);

// Thanh toán
purchasesRouter.post(
  '/checkout',
  accessTokenValidator,
  verifiedUserValidator,
  checkoutValidator,
  filterReqBodyMiddleware<CheckoutRequestBody>([
    'customer_gender',
    'customer_name',
    'customer_phone',
    'district',
    'note',
    'payment_method',
    'province',
    'purchases',
    'receive_method',
    'status',
    'street',
    'total_amount',
    'total_amount_reduced',
    'total_items',
    'transport_fee',
    'ward'
  ]),
  wrapRequestHandler(checkoutController)
);

export default purchasesRouter;
