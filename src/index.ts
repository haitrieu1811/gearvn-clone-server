import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet, { HelmetOptions } from 'helmet';

import { ENV_CONFIG, isProduction } from './constants/config';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import addressesRouter from './routes/addresses.routes';
import blogsRouter from './routes/blogs.routes';
import categoriesRouter from './routes/categories.routes';
import mediasRouter from './routes/medias.routes';
import ordersRouter from './routes/orders.routes';
import productsRouter from './routes/products.routes';
import purchasesRouter from './routes/purchases.routes';
import staticRouter from './routes/static.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { initFolders } from './utils/file';
initFolders();

databaseService.connect().then(() => {
  databaseService.indexUsers();
  databaseService.indexPurchases();
  databaseService.indexProducts();
  databaseService.indexRefreshTokens();
  databaseService.indexProductReviews();
});

const app = express();
const port = ENV_CONFIG.PORT || 4000;
const corsOptions = {
  origin: isProduction ? ENV_CONFIG.CLIENT_URL : '*'
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
});
const helmetOptions: HelmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' }
};

// app.use(limiter);
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use('/users', usersRouter);
app.use('/addresses', addressesRouter);
app.use('/categories', categoriesRouter);
app.use('/products', productsRouter);
app.use('/medias', mediasRouter);
app.use('/purchases', purchasesRouter);
app.use('/orders', ordersRouter);
app.use('/blogs', blogsRouter);
app.use('/static', staticRouter);
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
