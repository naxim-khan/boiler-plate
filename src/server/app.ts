//express app, middleware, routes
// src/server/app.ts (snippet)
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { userRoutes} from '../api/v1/routes/index.js';
import notFound from '../middlewares/notFound.js';
import errorHandler from '../middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(express.json());
app.use(morgan('combined')); // or use logger stream

app.use('/api/v1', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
