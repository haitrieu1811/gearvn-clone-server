import { Router } from 'express';

import {
  addToCartController,
  checkoutController,
  deleteAllPurchaseController,
  deletePurchaseController,
  getCartListController,
  updatePurchaseController
} from '~/controllers/purchases.controllers';
import {
  addToCartValidator,
  checkPurchaseExist,
  checkoutValidator,
  deletePurchaseValidator,
  updatePurchaseValidator
} from '~/middlewares/purchases.middlewares';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const purchasesRouter = Router();

purchasesRouter.post('/add-to-cart', accessTokenValidator, addToCartValidator, wrapRequestHandler(addToCartController));
purchasesRouter.get('/get-cart', accessTokenValidator, wrapRequestHandler(getCartListController));
purchasesRouter.put(
  '/update/:purchase_id',
  accessTokenValidator,
  checkPurchaseExist,
  updatePurchaseValidator,
  wrapRequestHandler(updatePurchaseController)
);
purchasesRouter.delete(
  '/delete',
  accessTokenValidator,
  deletePurchaseValidator,
  wrapRequestHandler(deletePurchaseController)
);
purchasesRouter.delete('/delete-all', accessTokenValidator, wrapRequestHandler(deleteAllPurchaseController));
purchasesRouter.post('/checkout', accessTokenValidator, checkoutValidator, wrapRequestHandler(checkoutController));

export default purchasesRouter;
