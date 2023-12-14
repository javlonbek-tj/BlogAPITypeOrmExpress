import { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.signup(req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Code has been sent to your email!',
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
    if (!userData.user.isActivated) {
      await authService.reSendActivationCode(userData.user.email);
      return res.status(200).json({
        status: 'success',
        message: 'Code has been resent to your email!',
      });
    }
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
    const tokens = await authService.refresh(jwt);
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
