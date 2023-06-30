import express from 'express';
import { config } from 'dotenv';
import usersRouter from './routes/users.routes';
config();

const app = express();
const port = process.env.PORT;

app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
