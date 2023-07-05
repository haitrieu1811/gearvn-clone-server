import { Router } from 'express';
import { getAllController } from '~/controllers/orders.controllers';

import { accessTokenValidator, adminRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const ordersRouter = Router();

ordersRouter.get(
  '/list',
  accessTokenValidator,
  verifiedUserValidator,
  adminRoleValidator,
  wrapRequestHandler(getAllController)
);

ordersRouter.get('/list', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getAllController));

export default ordersRouter;
