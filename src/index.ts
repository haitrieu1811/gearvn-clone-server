import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet, { HelmetOptions } from 'helmet';
import { createServer } from 'http';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import { ENV_CONFIG, isProduction } from './constants/config';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import addressesRouter from './routes/addresses.routes';
import blogsRouter from './routes/blogs.routes';
import brandsRouter from './routes/brands.routes';
import categoriesRouter from './routes/categories.routes';
import conversationsRouter from './routes/conversations.routes';
import mediasRouter from './routes/medias.routes';
import notificationsRouter from './routes/notifications.routes';
import ordersRouter from './routes/orders.routes';
import productsRouter from './routes/products.routes';
import purchasesRouter from './routes/purchases.routes';
import reivewsRouter from './routes/reviews.routes';
import staticRouter from './routes/static.routes';
import usersRouter from './routes/users.routes';
import vouchersRouter from './routes/vouchers.routes';
import databaseService from './services/database.services';
import { initFolders } from './utils/file';
import initSocket from './utils/socket';
initFolders();

databaseService.connect().then(() => {
  databaseService.indexUsers();
  databaseService.indexPurchases();
  databaseService.indexProducts();
  databaseService.indexOrders();
  databaseService.indexRefreshTokens();
  databaseService.indexReviews();
  databaseService.indexNotifications();
  databaseService.indexConversations();
  databaseService.indexVouchers();
});

const app = express();
const httpServer = createServer(app);

const port = ENV_CONFIG.PORT || 4000;
const corsOptions = {
  origin: isProduction ? ENV_CONFIG.CLIENT_URL : '*'
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
const helmetOptions: HelmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' }
};

const swaggerFile = fs.readFileSync(path.resolve('swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

// app.use(limiter);
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/users', usersRouter);
app.use('/addresses', addressesRouter);
app.use('/categories', categoriesRouter);
app.use('/brands', brandsRouter);
app.use('/products', productsRouter);
app.use('/reviews', reivewsRouter);
app.use('/medias', mediasRouter);
app.use('/purchases', purchasesRouter);
app.use('/vouchers', vouchersRouter);
app.use('/orders', ordersRouter);
app.use('/blogs', blogsRouter);
app.use('/notifications', notificationsRouter);
app.use('/conversations', conversationsRouter);
app.use('/static', staticRouter);
app.use(defaultErrorHandler);

initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
