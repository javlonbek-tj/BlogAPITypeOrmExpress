import 'dotenv/config';
import express, { Express } from 'express';
import config from 'config';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middlewares/error.middleware';
import api from './routes';
import logger from './utils/logger';
import validateEnv from './utils/validateEnv';
import passport from 'passport';
import { strategy } from './services/auth.service';
import connectDB from './data-source';

const port: number = config.get<number>('port');

async function start(): Promise<void> {
  try {
    /* validateEnv(); */
    await connectDB();
    const app: Express = express();

    app.use('/uploads', express.static(path.resolve('uploads')));

    passport.use(strategy);

    passport.initialize();

    app.use(express.json());
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));

    app.use(helmet());
    app.use(compression());

    app.use(
      cors({
        credentials: true,
        origin: config.get<string>('clientUrl'),
      })
    );

    app.use('/api/v1', api);

    app.use('*', (req, res) => {
      res.status(404).json({
        status: 'fail',
        message: `${req.originalUrl} - Route Not Found`,
      });
    });

    app.use(errorMiddleware);

    app.listen(port, () => {
      logger.info(`Server started on port: ${port}`);
    });
  } catch (e) {
    logger.error('Error in starting server', e);
  }
}

start();
