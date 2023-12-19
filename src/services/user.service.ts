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

const findOne = async (userId: string, viewerId: string) => {
  const userToBeViewed = await userRepo.findOneBy({ id: userId });
  if (userToBeViewed && viewerId) {
    if (userToBeViewed.posts.length <= 0) {
      userToBeViewed.userAward = 'BRONZE';
      await userRepo.save(userToBeViewed);
    }
    if (userToBeViewed.posts.length > 10) {
      userToBeViewed.userAward = 'SILVER';
      await userRepo.save(userToBeViewed);
    }
    if (userToBeViewed.posts.length > 20) {
      userToBeViewed.userAward = 'GOLD';
      await userRepo.save(userToBeViewed);
    }
    const isUserAlreadyViewed = userToBeViewed.viewers.find(
      (viewer) => viewer.id === viewerId
    );
    if (isUserAlreadyViewed) {
      return userToBeViewed;
    }
    const user = await userRepo.findOneBy({ id: viewerId });
    if (user) {
      userToBeViewed.viewers.push(user);
    }
    await userRepo.save(userToBeViewed);
  }
  throw ApiError.BadRequest('User not found');
};

/* const profileViewers = async (userId: string) => {
  const user = await userRepo.findUnique({
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
  const userToBeFollowed = await userRepo.findUnique({
    where: { id: followedUserId },
    select: getUserSelectFields(),
  });
  const followingUser = await userRepo.findUnique({
    where: { id: followingUserId },
    select: getUserSelectFields(),
  });
  if (userToBeFollowed && followingUser) {
    const isUserAlreadyFollowed = followingUser.followings.find(
      (following) => following.id === followedUserId
    );
    if (isUserAlreadyFollowed) {
      throw ApiError.BadRequest('You have already followed this user');
    }
    await userRepo.update({
      where: { id: followedUserId },
      data: {
        followers: {
          set: [
            ...userToBeFollowed.followers.map((f) => ({ id: f.id })),
            { id: followingUserId },
          ],
        },
      },
    });
    const updatedFollowingUser = await userRepo.update({
      where: { id: followingUserId },
      data: {
        followings: {
          set: [
            ...followingUser.followings.map((f) => ({ id: f.id })),
            { id: followedUserId },
          ],
        },
      },
      select: getUserSelectFields(),
    });
    return updatedFollowingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const unFollowUser = async (
  unFollowedUserId: string,
  unFollowingUserId: string
) => {
  const userToBeUnFollowed = await userRepo.findUnique({
    where: { id: unFollowedUserId },
    select: getUserSelectFields(),
  });
  const unFollowingUser = await userRepo.findUnique({
    where: { id: unFollowingUserId },
    select: getUserSelectFields(),
  });
  if (userToBeUnFollowed && unFollowingUser) {
    const isUserAlreadyUnFollowed = unFollowingUser.followings.find(
      (unFollowing) => unFollowing.id === unFollowedUserId
    );
    if (!isUserAlreadyUnFollowed) {
      throw ApiError.BadRequest('You have not followed this user');
    }
    await userRepo.update({
      where: { id: unFollowedUserId },
      data: {
        followers: {
          set: userToBeUnFollowed.followers.filter(
            (follower) => follower.id !== unFollowingUserId
          ),
        },
      },
    });
    const updatedUnFollowingUser = await userRepo.update({
      where: { id: unFollowingUserId },
      data: {
        followings: {
          set: unFollowingUser.followings.filter(
            (following) => following.id !== unFollowedUserId
          ),
        },
      },
      select: getUserSelectFields(),
    });

    return updatedUnFollowingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const blockUser = async (blockedUserId: string, blockingUserId: string) => {
  const userToBeBlocked = await userRepo.findUnique({
    where: { id: blockedUserId },
    select: getUserSelectFields(),
  });
  const blockingUser = await userRepo.findUnique({
    where: { id: blockingUserId },
    select: getUserSelectFields(),
  });
  if (userToBeBlocked && blockingUser) {
    const isUserAlreadyBlocked = blockingUser.blockings.find(
      (blocking) => blocking.id === blockedUserId
    );
    if (isUserAlreadyBlocked) {
      throw ApiError.BadRequest('You have already blocked this user');
    }
    const updatedBlockingUser = await userRepo.update({
      where: { id: blockingUserId },
      data: {
        blockings: {
          set: [
            ...blockingUser.blockings.map((b) => ({ id: b.id })),
            { id: blockedUserId },
          ],
        },
      },
      select: getUserSelectFields(),
    });
    return updatedBlockingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const unBlockUser = async (
  unBlockedUserId: string,
  unBlockingUserId: string
) => {
  const userToBeUnBlocked = await userRepo.findUnique({
    where: { id: unBlockedUserId },
    select: getUserSelectFields(),
  });
  const unBlockingUser = await userRepo.findUnique({
    where: { id: unBlockingUserId },
    select: getUserSelectFields(),
  });
  if (userToBeUnBlocked && unBlockingUser) {
    const isUserAlreadyUnBlocked = unBlockingUser.blockings.find(
      (blocking) => blocking.id === unBlockedUserId
    );
    if (!isUserAlreadyUnBlocked) {
      throw ApiError.BadRequest('You have not blocked this user');
    }
    const updatedUnBlockingUser = await userRepo.update({
      where: { id: unBlockingUserId },
      data: {
        blockings: {
          set: unBlockingUser.blockings.filter(
            (unBlocking) => unBlocking.id !== unBlockedUserId
          ),
        },
      },
      select: getUserSelectFields(),
    });
    return updatedUnBlockingUser;
  }
  throw ApiError.BadRequest('User not found');
};

const adminBlockUser = async (userId: string) => {
  const userToBeBlocked = await userRepo.findUnique({ where: { id: userId } });
  if (!userToBeBlocked) {
    throw ApiError.BadRequest('User not found');
  }
  if (userToBeBlocked.isBlocked) {
    throw ApiError.BadRequest('User already blocked');
  }
  return userRepo.update({
    where: { id: userId },
    data: {
      isBlocked: true,
    },
    select: getUserSelectFields(),
  });
};

const adminUnBlockUser = async (userId: string) => {
  const userToBeUnBlocked = await userRepo.findUnique({ where: { id: userId } });
  if (!userToBeUnBlocked) {
    throw ApiError.BadRequest('User not found');
  }
  if (!userToBeUnBlocked.isBlocked) {
    throw ApiError.BadRequest('User is not blocked');
  }
  return userRepo.update({
    where: { id: userId },
    data: {
      isBlocked: false,
    },
    select: getUserSelectFields(),
  });
};

const updateUserInfo = async (userId: string, input: UpdateUserInput) => {
  if (input.email) {
    const isEmailTaken = await userRepo.findUnique({
      where: { email: input.email },
    });
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
  return userRepo.update({
    where: { id: userId },
    data: dataToUpdate,
    select: getUserSelectFields(),
  });
};

const changeUserPassword = async (
  userId: string,
  { oldPass, newPass, newPassConfirm }: UpdatePasswordInput
) => {
  const user = await userRepo.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.BadRequest('User not Found');
  }
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
  return userRepo.update({
    where: { id: userId },
    data: {
      password: hashPassword,
      passwordChangedAt: new Date(),
    },
    select: getUserSelectFields(),
  });
};

const forgotPassword = async (email: string) => {
  const user = await userRepo.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.BadRequest('User not Found');
  }
  const resetToken = await createPasswordResetToken(email);
  const resetUrl = `${config.get<string>(
    'apiUrl'
  )}/users/resetPassword/${resetToken}`; */

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
    userRepo.update({
      where: { email },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }
};
 */
/* const resetPassword = async (
  resetToken: string,
  { password }: ResetPasswordInput
) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await userRepo.findFirst({
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
  await userRepo.update({
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
  const tokens = tokenService.generateTokens({
    id: user.id,
    email: user.email,
  });
  await tokenService.saveToken(user.id, tokens.refreshToken);
  return { ...tokens, user };
};

const deleteAccount = async (userId: string) => {
  await userRepo.delete({ where: { id: userId } });
}; */

export {
  findOne,
  /*  profileViewers,
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
  deleteAccount, */
  create,
};
