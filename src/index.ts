import express from 'express';
import { config } from 'dotenv';

import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import categoriesRouter from './routes/categories.routes';
config();

databaseService.connect();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
