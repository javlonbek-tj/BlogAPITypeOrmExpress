import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import config from 'config';
import ApiError from '../utils/appError';
import {
  CreateUserInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  UpdateUserInput,
} from '../schemas/user.schema';
import * as tokenService from './token.service';
import { sendMail } from './mail.service';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import * as roleService from './role.service';
import { deleteFile } from '../utils/files';
import { MoreThanOrEqual } from 'typeorm';

const userRepo = AppDataSource.getRepository(User);

const createPasswordResetToken = async (user: User) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const passwordResetExpires: Date = new Date();
  passwordResetExpires.setSeconds(
    passwordResetExpires.getSeconds() + 10 * 60 * 1000
  );
  passwordResetExpires.setMilliseconds(0);
  user.passwordResetToken = passwordResetToken;
  user.passwordResetExpires = passwordResetExpires;
  await userRepo.save(user);
  return resetToken;
};

const create = async (dto: CreateUserInput) => {
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const role = await roleService.getRoleByValue('USER');
  const randomSixDigitNumber = Math.floor(Math.random() * 900000) + 100000;
  const numberAsString = randomSixDigitNumber.toString();
  const hashedActivationCode = crypto
    .createHash('sha256')
    .update(numberAsString)
    .digest('hex');
  const activationCodeExpires: Date = new Date();
  activationCodeExpires.setSeconds(activationCodeExpires.getSeconds() + 60); // Add 60 seconds
  activationCodeExpires.setMilliseconds(0);

  const user = userRepo.create({
    ...dto,
    password: hashedPassword,
    activationCode: hashedActivationCode,
    activationCodeExpires,
    role: role,
  });
  await userRepo.save(user);
  return { user, randomSixDigitNumber };
};

const findAll = async () => {
  return await userRepo.find();
};

const findOne = async (userId: string, viewingUser: User) => {
  const userToBeViewed = await userRepo.findOne({
    where: { id: userId },
    relations: ['posts', 'viewers', 'followers', 'followings'],
  });
  if (userToBeViewed && viewingUser) {
    if (userToBeViewed.posts.length <= 0) {
      userToBeViewed.userAward = 'bronze';
      await userRepo.save(userToBeViewed);
    }
    if (userToBeViewed.posts.length > 10) {
      userToBeViewed.userAward = 'silver';
      await userRepo.save(userToBeViewed);
    }
    if (userToBeViewed.posts.length > 20) {
      userToBeViewed.userAward = 'gold';
      await userRepo.save(userToBeViewed);
    }
    const isUserAlreadyViewed = userToBeViewed.viewers.find(
      (viewer) => viewer.id === viewingUser.id
    );
    if (isUserAlreadyViewed) {
      return userToBeViewed;
    }
    userToBeViewed.viewers.push(viewingUser);
    return await userRepo.save(userToBeViewed);
  }
  throw ApiError.BadRequest('User not found');
};

const profileViewers = async (userId: string) => {
  const user = await userRepo.findOne({
    where: { id: userId },
    relations: ['viewers'],
  });
  if (!user) {
    throw ApiError.BadRequest('User not found');
  }
  return user;
};

const followUser = async (followerId: string, followingId: string) => {
  const follower = await userRepo.findOne({
    where: { id: followerId },
    relations: ['followers'],
  });
  const following = await userRepo.findOne({
    where: { id: followingId },
    relations: ['followings'],
  });
  if (follower && following) {
    const isUserAlreadyFollowed = following.followings.find(
      (followedUser) => followedUser.id === followerId
    );
    if (isUserAlreadyFollowed) {
      throw ApiError.BadRequest('You have already followed this user');
    }
    follower.followers.push(following);
    following.followings.push(follower);
    await userRepo.save(follower);
    return userRepo.save(following);
  }
  throw ApiError.BadRequest('User not found');
};

const unFollowUser = async (unfollowerId: string, unFollowingId: string) => {
  const unFollower = await userRepo.findOne({
    where: { id: unfollowerId },
    relations: ['followers'],
  });
  const unFollowing = await userRepo.findOne({
    where: { id: unFollowingId },
    relations: ['followings'],
  });
  if (unFollower && unFollowing) {
    const isUserAlreadyUnFollowed = unFollowing.followings.find(
      (unFollowing) => unFollowing.id === unfollowerId
    );
    if (!isUserAlreadyUnFollowed) {
      throw ApiError.BadRequest('You have not followed this user');
    }
    unFollower.followers = unFollower.followers.filter(
      (follower) => follower.id !== unFollowingId
    );
    unFollowing.followings = unFollowing.followings.filter(
      (unFollowing) => unFollowing.id !== unfollowerId
    );
    await userRepo.save(unFollower);
    return userRepo.save(unFollowing);
  }
  throw ApiError.BadRequest('User not found');
};

const blockUser = async (blockedUserId: string, blockingUserId: string) => {
  const userToBeBlocked = await userRepo.findOne({
    where: { id: blockedUserId },
  });
  const blockingUser = await userRepo.findOne({
    where: { id: blockingUserId },
    relations: ['blockings'],
  });
  if (userToBeBlocked && blockingUser) {
    const isUserAlreadyBlocked = blockingUser.blockings.find(
      (blocking) => blocking.id === blockedUserId
    );
    if (isUserAlreadyBlocked) {
      throw ApiError.BadRequest('You have already blocked this user');
    }
    blockingUser.blockings.push(userToBeBlocked);
    return userRepo.save(blockingUser);
  }
  throw ApiError.BadRequest('User not found');
};

const unBlockUser = async (
  unBlockedUserId: string,
  unBlockingUserId: string
) => {
  const userToBeUnBlocked = await userRepo.findOne({
    where: { id: unBlockedUserId },
  });
  const unBlockingUser = await userRepo.findOne({
    where: { id: unBlockingUserId },
    relations: ['blockings'],
  });
  if (userToBeUnBlocked && unBlockingUser) {
    const isUserAlreadyUnBlocked = unBlockingUser.blockings.find(
      (blocking) => blocking.id === unBlockedUserId
    );
    if (!isUserAlreadyUnBlocked) {
      throw ApiError.BadRequest('You have not blocked this user');
    }
    unBlockingUser.blockings = unBlockingUser.blockings.filter(
      (unBloking) => unBloking.id !== unBlockedUserId
    );
    return userRepo.save(unBlockingUser);
  }
  throw ApiError.BadRequest('User not found');
};

const adminBlockUser = async (userId: string) => {
  const userToBeBlocked = await userRepo.findOne({
    where: { id: userId },
    relations: ['blockings'],
  });
  if (!userToBeBlocked) {
    throw ApiError.BadRequest('User not found');
  }
  if (userToBeBlocked.isBlocked) {
    throw ApiError.BadRequest('User already blocked');
  }
  userToBeBlocked.isBlocked = true;
  return userRepo.save(userToBeBlocked);
};

const adminUnBlockUser = async (userId: string) => {
  const userToBeUnBlocked = await userRepo.findOne({
    where: { id: userId },
    relations: ['blockings'],
  });
  if (!userToBeUnBlocked) {
    throw ApiError.BadRequest('User not found');
  }
  if (!userToBeUnBlocked.isBlocked) {
    throw ApiError.BadRequest('User is not blocked');
  }
  userToBeUnBlocked.isBlocked = false;
  return userRepo.save(userToBeUnBlocked);
};

const updateUserInfo = async (user: User, input: UpdateUserInput) => {
  if (input.email) {
    const isEmailTaken = await userRepo.findOne({
      where: { email: input.email },
    });
    if (isEmailTaken) {
      throw ApiError.BadRequest(`${input.email} is already taken`);
    }
  }
  if (input.profilPhoto) {
    deleteFile(input.profilPhoto);
  }
  Object.assign(user, input);
  return userRepo.save(user);
};

const changeUserPassword = async (
  user: User,
  { oldPass, newPass, newPassConfirm }: UpdatePasswordInput
) => {
  const isPassEquals = await bcrypt.compare(oldPass, user.password);
  if (!isPassEquals) {
    throw ApiError.BadRequest('Old password is incorrect');
  }
  if (newPass !== newPassConfirm) {
    throw ApiError.BadRequest(
      'New Password and Password Confirmation are not the same'
    );
  }
  const hashPassword = await bcrypt.hash(newPass, 10);
  user.password = hashPassword;
  user.passwordChangedAt = new Date();
  return userRepo.save(user);
};

const forgotPassword = async (email: string) => {
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    throw ApiError.BadRequest('User not Found');
  }
  const resetToken = await createPasswordResetToken(user);
  const resetUrl = `${config.get<string>(
    'apiUrl'
  )}/users/resetPassword/${resetToken}`;

  // Send resetUrl to user's email
  try {
    const subject = 'Your password reset token (valid for only 10 minutes)';
    const link = `${config.get<string>(
      'apiUrl'
    )}/users/resetPassword/${resetUrl}`;
    const html = `<div>
            <h1>For reset password hit this link</h1>
            <a href="${link}">${link}</a>
            </div>`;
    sendMail(email, subject, html);
  } catch (e) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await userRepo.save(user);
  }
};

const resetPassword = async (
  resetToken: string,
  { password }: ResetPasswordInput
) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await userRepo.findOne({
    where: {
      passwordResetToken,
      passwordResetExpires: MoreThanOrEqual(new Date()),
    },
  });
  if (!user) {
    throw ApiError.BadRequest('Token is invalid or has expired');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.passwordChangedAt = new Date();
  await userRepo.save(user);
  const tokens = tokenService.generateTokens({
    sub: user.id,
    email: user.email,
  });
  await tokenService.saveToken(user.id, tokens.refreshToken);
  return { ...tokens, user };
};

const deleteAccount = async (user: User) => {
  await userRepo.remove(user);
};

export {
  findAll,
  findOne,
  profileViewers,
  followUser,
  unFollowUser,
  blockUser,
  unBlockUser,
  adminBlockUser,
  adminUnBlockUser,
  updateUserInfo,
  changeUserPassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  create,
};
