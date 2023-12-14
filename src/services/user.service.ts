import { getUserSelectFields } from './../utils/getSelectedField';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';
import config from 'config';
import ApiError from '../utils/appError';
import db from '../utils/db';
import { ResetPasswordInput, UpdatePasswordInput, UpdateUserInput } from '../schemas/user.schema';
import * as tokenService from './token.service';
import { sendMail } from './mail.service';

const changedPasswordAfter = (JWTTimestamp: number, passwordChangedAt: Date | null): boolean => {
  if (passwordChangedAt) {
    const changedTimestamp: number = passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const createPasswordResetToken = async (email: string) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const passwordResetExpires: number = Date.now() + 10 * 60 * 1000;
  await db.user.update({
    where: { email },
    data: {
      passwordResetToken,
      passwordResetExpires,
    },
  });
  return resetToken;
};

const findOne = async (userId: string, viewerId: string) => {
  const userToBeViewed = await db.user.findUnique({
    where: { id: userId },
    select: getUserSelectFields(),
  });
  if (userToBeViewed && viewerId) {
    if (userToBeViewed.posts.length <= 0) {
      await db.user.update({
        where: { id: userId },
        data: {
          userAward: 'BRONZE',
        },
      });
    }
    if (userToBeViewed.posts.length > 10) {
      await db.user.update({
        where: { id: userId },
        data: {
          userAward: 'SILVER',
        },
      });
    }
    if (userToBeViewed.posts.length > 20) {
      await db.user.update({
        where: { id: userId },
        data: {
          userAward: 'GOLD',
        },
      });
    }
    const isUserAlreadyViewed = userToBeViewed.viewers.find(viewer => viewer.id === viewerId);
    if (isUserAlreadyViewed) {
      return userToBeViewed;
    }
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        viewers: {
          set: [...userToBeViewed.viewers.map(v => ({ id: v.id })), { id: viewerId }],
        },
      },
      select: getUserSelectFields(),
    });
    return updatedUser;
  }
  throw ApiError.BadRequest('User not found');
};

const profileViewers = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      viewers: {
        select: getUserSelectFields(),
      },
    },
  });
  if (!user) {
    throw ApiError.BadRequest('User not found');
  }
  return user;
};

const followUser = async (followedUserId: string, followingUserId: string) => {
  const userToBeFollowed = await db.user.findUnique({ where: { id: followedUserId }, select: getUserSelectFields() });
  const followingUser = await db.user.findUnique({ where: { id: followingUserId }, select: getUserSelectFields() });
  if (userToBeFollowed && followingUser) {
    const isUserAlreadyFollowed = followingUser.followings.find(following => following.id === followedUserId);
    if (isUserAlreadyFollowed) {
      throw ApiError.BadRequest('You have already followed this user');
    }
    await db.user.update({
      where: { id: followedUserId },
      data: {
        followers: {
          set: [...userToBeFollowed.followers.map(f => ({ id: f.id })), { id: followingUserId }],
        },
      },
    });
    const updatedFollowingUser = await db.user.update({
      where: { id: followingUserId },
      data: {
        followings: {
          set: [...followingUser.followings.map(f => ({ id: f.id })), { id: followedUserId }],
        },
      },
      select: getUserSelectFields(),
    });
    return updatedFollowingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const unFollowUser = async (unFollowedUserId: string, unFollowingUserId: string) => {
  const userToBeUnFollowed = await db.user.findUnique({ where: { id: unFollowedUserId }, select: getUserSelectFields() });
  const unFollowingUser = await db.user.findUnique({ where: { id: unFollowingUserId }, select: getUserSelectFields() });
  if (userToBeUnFollowed && unFollowingUser) {
    const isUserAlreadyUnFollowed = unFollowingUser.followings.find(unFollowing => unFollowing.id === unFollowedUserId);
    if (!isUserAlreadyUnFollowed) {
      throw ApiError.BadRequest('You have not followed this user');
    }
    await db.user.update({
      where: { id: unFollowedUserId },
      data: {
        followers: {
          set: userToBeUnFollowed.followers.filter(follower => follower.id !== unFollowingUserId),
        },
      },
    });
    const updatedUnFollowingUser = await db.user.update({
      where: { id: unFollowingUserId },
      data: {
        followings: {
          set: unFollowingUser.followings.filter(following => following.id !== unFollowedUserId),
        },
      },
      select: getUserSelectFields(),
    });

    return updatedUnFollowingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const blockUser = async (blockedUserId: string, blockingUserId: string) => {
  const userToBeBlocked = await db.user.findUnique({ where: { id: blockedUserId }, select: getUserSelectFields() });
  const blockingUser = await db.user.findUnique({ where: { id: blockingUserId }, select: getUserSelectFields() });
  if (userToBeBlocked && blockingUser) {
    const isUserAlreadyBlocked = blockingUser.blockings.find(blocking => blocking.id === blockedUserId);
    if (isUserAlreadyBlocked) {
      throw ApiError.BadRequest('You have already blocked this user');
    }
    const updatedBlockingUser = await db.user.update({
      where: { id: blockingUserId },
      data: {
        blockings: {
          set: [...blockingUser.blockings.map(b => ({ id: b.id })), { id: blockedUserId }],
        },
      },
      select: getUserSelectFields(),
    });
    return updatedBlockingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const unBlockUser = async (unBlockedUserId: string, unBlockingUserId: string) => {
  const userToBeUnBlocked = await db.user.findUnique({ where: { id: unBlockedUserId }, select: getUserSelectFields() });
  const unBlockingUser = await db.user.findUnique({ where: { id: unBlockingUserId }, select: getUserSelectFields() });
  if (userToBeUnBlocked && unBlockingUser) {
    const isUserAlreadyUnBlocked = unBlockingUser.blockings.find(blocking => blocking.id === unBlockedUserId);
    if (!isUserAlreadyUnBlocked) {
      throw ApiError.BadRequest('You have not blocked this user');
    }
    const updatedUnBlockingUser = await db.user.update({
      where: { id: unBlockingUserId },
      data: {
        blockings: {
          set: unBlockingUser.blockings.filter(unBlocking => unBlocking.id !== unBlockedUserId),
        },
      },
      select: getUserSelectFields(),
    });
    return updatedUnBlockingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const adminBlockUser = async (userId: string) => {
  const userToBeBlocked = await db.user.findUnique({ where: { id: userId } });
  if (!userToBeBlocked) {
    throw ApiError.BadRequest('User not found');
  }
  if (userToBeBlocked.isBlocked) {
    throw ApiError.BadRequest('User already blocked');
  }
  return db.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
    },
    select: getUserSelectFields(),
  });
};

const adminUnBlockUser = async (userId: string) => {
  const userToBeUnBlocked = await db.user.findUnique({ where: { id: userId } });
  if (!userToBeUnBlocked) {
    throw ApiError.BadRequest('User not found');
  }
  if (!userToBeUnBlocked.isBlocked) {
    throw ApiError.BadRequest('User is not blocked');
  }
  return db.user.update({
    where: { id: userId },
    data: {
      isBlocked: false,
    },
    select: getUserSelectFields(),
  });
};

const updateUserInfo = async (userId: string, input: UpdateUserInput) => {
  if (input.email) {
    const isEmailTaken = await db.user.findUnique({ where: { email: input.email } });
    if (isEmailTaken) {
      throw ApiError.BadRequest(`${input.email} is already taken`);
    }
  }
  const dataToUpdate: UpdateUserInput = {};

  if (input.firstname !== undefined) {
    dataToUpdate.firstname = input.firstname;
  }

  if (input.lastname !== undefined) {
    dataToUpdate.lastname = input.lastname;
  }

  if (input.email !== undefined) {
    dataToUpdate.email = input.email;
  }

  if (input.profilPhoto !== undefined) {
    dataToUpdate.profilPhoto = input.profilPhoto;
  }
  return db.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: getUserSelectFields(),
  });
};

const changeUserPassword = async (userId: string, { oldPass, newPass, newPassConfirm }: UpdatePasswordInput) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.BadRequest('User not Found');
  }
  const isPassEquals = await bcrypt.compare(oldPass, user.password);
  if (!isPassEquals) {
    throw ApiError.BadRequest('Old password is incorrect');
  }
  if (newPass !== newPassConfirm) {
    throw ApiError.BadRequest('New Password and Password Confirmation are not the same');
  }
  const hashPassword = await bcrypt.hash(newPass, 10);
  return db.user.update({
    where: { id: userId },
    data: {
      password: hashPassword,
      passwordChangedAt: new Date(),
    },
    select: getUserSelectFields(),
  });
};

const forgotPassword = async (email: string) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.BadRequest('User not Found');
  }
  const resetToken = await createPasswordResetToken(email);
  const resetUrl = `${config.get<string>('apiUrl')}/users/resetPassword/${resetToken}`;

  // Send resetUrl to user's email
  /* try {
    const subject = 'Your password reset token (valid for only 10 minutes)';
    const link = `${config.get<string>('apiUrl')}/users/resetPassword/${resetUrl}`;
    const html = `<div>
            <h1>For reset password hit this link</h1>
            <a href="${link}">${link}</a>
            </div>`;
    sendMail(email, subject, html);
  } catch (e) {
    db.user.update({
      where: { email },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  } */
};

const resetPassword = async (resetToken: string, { password }: ResetPasswordInput) => {
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await db.user.findFirst({
    where: {
      passwordResetToken,
      passwordResetExpires: {
        gt: Date.now(),
      },
    },
  });
  if (!user) {
    throw ApiError.BadRequest('Token is invalid or has expired');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date(),
    },
  });
  const tokens = tokenService.generateTokens({ id: user.id, email: user.email });
  await tokenService.saveToken(user.id, tokens.refreshToken);
  return { ...tokens, user };
};

const deleteAccount = async (userId: string) => {
  await db.user.delete({ where: { id: userId } });
};

export {
  findOne,
  profileViewers,
  changedPasswordAfter,
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
};
