import 'dotenv/config';
import jwt from 'jsonwebtoken';
import config from 'config';
import { AppDataSource } from '../data-source';
import { Token } from '../entities/token.entity';

/* type DecodedToken<T> = T & {
  iat: number;
}; */

type JwtPayload = {
  sub: string;
  email: string;
};

const tokenRepo = AppDataSource.getRepository(Token);

const generateTokens = (payload: JwtPayload) => {
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

/* const validateAccessToken = (token: string): DecodedToken<Payload> => {
  const userData = jwt.verify(
    token,
    config.get<string>('accessTokenKey')
  ) as DecodedToken<Payload>;
  return userData;
};

const validateRefreshToken = (token: string): DecodedToken<Payload> => {
  const userData = jwt.verify(
    token,
    config.get<string>('refreshTokenKey')
  ) as DecodedToken<Payload>;
  return userData;
}; */

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

export {
  generateTokens,
  /*   validateAccessToken,
  validateRefreshToken, */
  saveToken,
  findToken,
  removeToken,
  JwtPayload,
};
