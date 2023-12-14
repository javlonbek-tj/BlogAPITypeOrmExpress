import 'dotenv/config';
import jwt from 'jsonwebtoken';
import config from 'config';
import db from '../utils/db';

type DecodedToken<T> = T & {
  iat: number;
};

type Payload = {
  id: string;
  email: string;
};

const generateTokens = (payload: Payload) => {
  const accessToken = jwt.sign(payload, config.get<string>('accessTokenKey'), {
    expiresIn: config.get<string>('accessTokenExpiresIn'),
  });
  const refreshToken = jwt.sign(payload, config.get<string>('refreshTokenKey'), {
    expiresIn: config.get<string>('refreshTokenExpiresIn'),
  });
  return {
    accessToken,
    refreshToken,
  };
};

const validateAccessToken = (token: string): DecodedToken<Payload> => {
  const userData = jwt.verify(token, config.get<string>('accessTokenKey')) as DecodedToken<Payload>;
  return userData;
};

const validateRefreshToken = (token: string): DecodedToken<Payload> => {
  const userData = jwt.verify(token, config.get<string>('refreshTokenKey')) as DecodedToken<Payload>;
  return userData;
};

const saveToken = async (userId: string, refreshToken: string) => {
  const tokenData = await db.token.findUnique({ where: { userId } });
  if (tokenData) {
    const updatedTokenData = await db.token.update({
      where: { userId },
      data: {
        refreshToken,
      },
    });

    return updatedTokenData;
  }
  const token = await db.token.create({
    data: {
      userId,
      refreshToken,
    },
  });
  return token;
};

const findToken = async (refreshToken: string) => {
  const tokenData = await db.token.findFirst({ where: { refreshToken } });
  return tokenData;
};

const removeToken = async (refreshToken: string) => {
  const tokenData = await db.token.findFirst({ where: { refreshToken } });
  if (tokenData) {
    await db.token.delete({ where: { id: tokenData.id } });
  }
  return tokenData;
};

export { generateTokens, validateAccessToken, validateRefreshToken, saveToken, findToken, removeToken };
