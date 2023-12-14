import 'dotenv/config';
import { DataSource } from 'typeorm';
import logger from './utils/logger';
import config from 'config';

const postgresConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>('postgresConfig');

export const AppDataSource = new DataSource({
  ...postgresConfig,
  type: 'postgres',
  synchronize: false,
  logging: false,
  entities: ['src/entities/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  subscribers: ['src/subscribers/**/*{.ts,.js}'],
});

export default async function connectDB() {
  try {
    AppDataSource.initialize();
  } catch (err) {
    logger.error('Error in initializing data source', err);
  }
}
