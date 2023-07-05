import { config } from 'dotenv';
import express from 'express';

import { defaultErrorHandler } from './middlewares/error.middlewares';
import categoriesRouter from './routes/categories.routes';
import mediasRouter from './routes/medias.routes';
import productsRouter from './routes/products.routes';
import purchasesRouter from './routes/purchases.routes';
import staticRouter from './routes/static.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { initFolders } from './utils/file';
import ordersRouter from './routes/orders.routes';
config();
initFolders();

databaseService.connect();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/products', productsRouter);
app.use('/medias', mediasRouter);
app.use('/purchases', purchasesRouter);
app.use('/orders', ordersRouter);
app.use('/static', staticRouter);
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
