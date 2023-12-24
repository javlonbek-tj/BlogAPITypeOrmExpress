import { cleanEnv, port, str, url, email, host } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    PORT: port(),
    CLIENT_URL: url(),
    API_URL: url(),
    AT_SECRET: str(),
    RT_SECRET: str(),
    AT_EXPIRATION_DATE: str(),
    RT_EXPIRATION_DATE: str(),
    NODEMAILER_USER: email(),
    NODEMAILER_PASS: str(),
    POSTGRES_HOST: host(),
    POSTGRES_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),
  });
};

export default validateEnv;
