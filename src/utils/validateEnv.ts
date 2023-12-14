import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    PORT: port(),
    DATABASE_URL: str(),
    CLIENT_URL: str(),
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    ACCESS_TOKEN_EXPIRES_IN: str(),
    REFRESH_TOKEN_EXPIRES_IN: str(),
  });
};

export default validateEnv;
