import { NextFunction, Request, Response, Express } from 'express';
import * as userService from '../services/user.service';
import { GetUserInput, UpdateUserInput } from '../schemas/user.schema';
import { User } from '../entities/user.entity';

export const profileViewersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user as User;
    const user = await userService.profileViewers(currentUser.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

export const myLikedUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user as User;
    const user = await userService.myLikesPosts(currentUser.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

export const myDislikedUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user as User;
    const user = await userService.myDisLikedPosts(currentUser.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

export const myBlokingUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user as User;
    const user = await userService.myBlokingUsers(currentUser.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

export const getAllUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.findAll();
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (e) {
    next(e);
  }
};

export const oneUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId;
    const userToBeViewed = await userService.findOne(userId, req.user as User);
    res.status(200).json({
      status: 'success',
      data: userToBeViewed,
    });
  } catch (e) {
    next(e);
  }
};

export const followerUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = req.user as User;
    const followingUser = await userService.followUser(req.params.userId, currentUser.id);
    res.status(200).json({
      status: 'success',
      data: followingUser,
    });
  } catch (e) {
    next(e);
  }
};

export const userFollowersHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = req.user as User;
    const userFollowers = await userService.userFollowers(req.params.userId, currentUser.id);
    res.status(200).json({
      status: 'success',
      data: userFollowers,
    });
  } catch (e) {
    next(e);
  }
};

export const userFollowingsHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = req.user as User;
    const userFollowings = await userService.userFollowings(req.params.userId, currentUser.id);
    res.status(200).json({
      status: 'success',
      data: userFollowings,
    });
  } catch (e) {
    next(e);
  }
};

export const unFollowerUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = req.user as User;
    const unFollowingUser = await userService.unFollowUser(req.params.userId, currentUser.id);
    res.status(200).json({
      status: 'success',
      data: unFollowingUser,
    });
  } catch (e) {
    next(e);
  }
};

export const blockUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = req.user as User;
    const blockingUser = await userService.blockUser(req.params.userId, currentUser.id);
    res.status(200).json({
      status: 'success',
      data: blockingUser,
    });
  } catch (e) {
    next(e);
  }
};

export const unBlockUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = req.user as User;
    const unBlockingUser = await userService.unBlockUser(req.params.userId, currentUser.id);
    res.status(200).json({
      status: 'success',
      data: unBlockingUser,
    });
  } catch (e) {
    next(e);
  }
};

export const adminBlockUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const blockedUser = await userService.adminBlockUser(req.params.userId);
    res.status(200).json({
      status: 'success',
      data: blockedUser,
    });
  } catch (e) {
    next(e);
  }
};

export const adminUnBlockUserHandler = async (
  req: Request<GetUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const unBlockedUser = await userService.adminUnBlockUser(req.params.userId);
    res.status(200).json({
      status: 'success',
      data: unBlockedUser,
    });
  } catch (e) {
    next(e);
  }
};

export const updateUserInfoHandler = async (
  req: Request<{}, {}, UpdateUserInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profilPhoto = req.file?.path;
    const updatedUser = await userService.updateUserInfo(req.user as User, {
      ...req.body,
      profilPhoto,
    });
    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (e) {
    next(e);
  }
};

export const changeUserPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await userService.changeUserPassword(req.user as User, req.body);
    res.status(200).json({
      status: 'success',
      message: 'You have successfully changed your password!',
    });
  } catch (e) {
    next(e);
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.status(200).json({
      status: 'success',
      message: 'ResetToken sent to your email!',
    });
  } catch (e) {
    next(e);
  }
};

export const resetPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.resetPassword(req.params.resetToken, req.body);
    res.status(200).json({
      status: 'success',
      message: 'You have successfully changed your password!',
    });
  } catch (e) {
    next(e);
  }
};

export const deleteAccountHanlder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deleteAccount(req.user as User);
    res.status(204).json({
      status: 'success',
      message: 'User has been deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};
