import { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import * as authService from '../services/auth.service';
import { Role } from '../entities/role.entity';
import ApiError from '../utils/appError';
import { User } from '../entities/user.entity';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = await authService.signup(req.body);
    return res.status(201).json({
      status: 'success',
      data: accessToken,
    });
  } catch (e) {
    next(e);
  }
};

export const reSendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authService.reSendActivationCode(email);
    return res.status(200).json({
      status: 'success',
      message: 'Code has been resent to your email!',
    });
  } catch (e) {
    next(e);
  }
};

export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await authService.activate(req.body.activationCode);
    res.cookie('jwt', tokens.refreshToken, authService.cookieOptions());
    return res.status(201).json({
      status: 'success',
      data: tokens,
    });
  } catch (e) {
    next(e);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = await authService.signin(req.body);
    /* if (!userData.user.isActivated) {
      await authService.reSendActivationCode(userData.user.email);
      return res.status(200).json({
        status: 'success',
        message: 'Code has been resent to your email!',
      });
    } */
    res.cookie('jwt', userData.refreshToken, authService.cookieOptions());
    return res.status(200).json({
      status: 'success',
      userData,
    });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jwt } = req.cookies;
    const tokens = await authService.refresh(jwt, req.user as User);
    res.cookie('jwt', tokens.refreshToken, authService.cookieOptions());
    return res.status(200).json({
      status: 'success',
      data: tokens,
    });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jwt } = req.cookies;
    await authService.signout(jwt);
    res.clearCookie('jwt');
    return res.status(200).json({
      status: 'success',
      message: 'You have successfully logged out',
    });
  } catch (e) {
    next(e);
  }
};

export function restrictTo(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User & { role?: Role };
    if (!user || !user.role || !roles.includes(user.role.value)) {
      return next(ApiError.UnauthorizedError());
    }
    next();
  };
}
