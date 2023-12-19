import 'dotenv/config';
import jwt from 'jsonwebtoken';
import config from 'config';
import { AppDataSource } from '../data-source';
import { Token } from '../entities/token.entity';

type JwtPayload = {
  sub: string;
  email: string;
  iat: number;
};

const tokenRepo = AppDataSource.getRepository(Token);

const generateTokens = (payload: Omit<JwtPayload, 'iat'>) => {
  const accessToken = jwt.sign(payload, config.get<string>('accessTokenKey'), {
    expiresIn: config.get<string>('accessTokenExpiresIn'),
  });
  const refreshToken = jwt.sign(
    payload,
    config.get<string>('refreshTokenKey'),
    {
      expiresIn: config.get<string>('refreshTokenExpiresIn'),
    }
  );
  return {
    accessToken,
    refreshToken,
  };
};

const saveToken = async (userId: string, refreshToken: string) => {
  const tokenData = await tokenRepo.findOne({ where: { userId } });
  if (tokenData) {
    tokenData.refreshToken = refreshToken;
    return tokenRepo.save(tokenData);
  }
  const token = tokenRepo.create({
    userId,
    refreshToken,
  });
  await tokenRepo.save(token);
  return token;
};

const findToken = async (refreshToken: string) => {
  const tokenData = await tokenRepo.findOne({ where: { refreshToken } });
  return tokenData;
};

const removeToken = async (refreshToken: string) => {
  const tokenData = await tokenRepo.findOne({ where: { refreshToken } });
  if (tokenData) {
    await tokenRepo.remove(tokenData);
  }
  return tokenData;
};

export { generateTokens, saveToken, findToken, removeToken, JwtPayload };
