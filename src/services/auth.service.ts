import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';
import { CreateUserInput, LoginUserInput } from '../schemas/user.schema';
import ApiError from '../utils/appError';
import { sendActivationCode, sendMail } from './mail.service';
import * as tokenService from './token.service';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import * as userService from './user.service';
import { MoreThanOrEqual } from 'typeorm';

const userRepo = AppDataSource.getRepository(User);

const signup = async (dto: CreateUserInput) => {
  const isUserExists = await userRepo.findOne({
    where: { email: dto.email },
  });
  if (isUserExists) {
    throw ApiError.BadRequest(`${dto.email} is already taken`);
  }
  const { user, randomSixDigitNumber } = await userService.create(dto);
  await userRepo.save(user);
  try {
    sendActivationCode(user, randomSixDigitNumber);
  } catch (e) {
    await userRepo.remove(user);
    throw new ApiError(500, 'There was an error sending the email. Try again later!');
  }
};

const reSendActivationCode = async (user: User) => {
  const randomSixDigitNumber = Math.floor(Math.random() * 900000) + 100000;
  const numberAsString = randomSixDigitNumber.toString();
  const hashedActivationCode = crypto.createHash('sha256').update(numberAsString).digest('hex');
  const activationCodeExpires: Date = new Date();
  activationCodeExpires.setMinutes(activationCodeExpires.getMinutes() + 1);
  user.activationCode = hashedActivationCode;
  user.activationCodeExpires = activationCodeExpires;
  await userRepo.save(user);
  try {
    sendActivationCode(user, randomSixDigitNumber);
  } catch (e) {
    throw new ApiError(500, 'There was an error sending the email. Try again later!');
  }
};

const activate = async (activationCode: string) => {
  const hashedActivationCode = crypto.createHash('sha256').update(activationCode).digest('hex');
  const user = await userRepo.findOne({
    where: {
      activationCode: hashedActivationCode,
      activationCodeExpires: MoreThanOrEqual(new Date()),
    },
  });
  if (!user) {
    throw ApiError.BadRequest('Incorrect Code');
  }
  user.isActivated = true;
  user.activationCode = null;
  user.activationCodeExpires = null;
  await userRepo.save(user);
  const tokens = tokenService.generateTokens({
    sub: user.id,
    email: user.email,
  });
  await tokenService.saveToken(user.id, tokens.refreshToken);
  return { ...tokens, user };
};

const signin = async (input: LoginUserInput) => {
  const existingUser = await userRepo.findOne({
    where: { email: input.email },
  });
  if (!existingUser) {
    throw ApiError.BadRequest('Email or password incorrect');
  }
  const isPassCorrect = await bcrypt.compare(input.password, existingUser.password);
  if (!isPassCorrect) {
    throw ApiError.BadRequest('Email or password incorrect');
  }
  const tokens = tokenService.generateTokens({
    sub: existingUser.id,
    email: existingUser.email,
  });
  await tokenService.saveToken(existingUser.id, tokens.refreshToken);
  return { ...tokens, user: existingUser };
};

const refresh = async (refreshToken: string, user: User) => {
  if (!refreshToken) {
    throw ApiError.UnauthenticatedError();
  }
  const tokenFromDb = await tokenService.findToken(refreshToken);
  if (!user || !tokenFromDb) {
    throw ApiError.UnauthorizedError();
  }
  const tokens = tokenService.generateTokens({
    sub: user.id,
    email: user.email,
  });
  await tokenService.saveToken(user.id, tokens.refreshToken);
  return tokens;
};

const signout = (refreshToken: string) => {
  return tokenService.removeToken(refreshToken);
};

const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions: {
    maxAge: number;
    httpOnly: boolean;
    secure?: boolean;
  } = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };
  if (isProduction) {
    cookieOptions.secure = true;
  }
  return cookieOptions;
};

const changedPasswordAfter = (JWTTimestamp: number, passwordChangedAt: Date | null): boolean => {
  if (passwordChangedAt) {
    const changedTimestamp: number = passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export {
  signup,
  reSendActivationCode,
  activate,
  signin,
  refresh,
  signout,
  cookieOptions,
  changedPasswordAfter,
};
