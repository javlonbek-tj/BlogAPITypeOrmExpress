import { updatePasswordSchema, updateUserSchema } from './../schemas/user.schema';
import { Router } from 'express';
import {
  adminBlockUserHandler,
  adminUnBlockUserHandler,
  blockUserHandler,
  changeUserPasswordHandler,
  deleteAccountHanlder,
  followerUserHandler,
  forgotPasswordHandler,
  getAllUsersHandler,
  oneUserHandler,
  resetPasswordHandler,
  unBlockUserHandler,
  unFollowerUserHandler,
  updateUserInfoHandler,
  profileViewersHandler,
  userFollowersHandler,
  userFollowingsHandler,
  myLikedUsersHandler,
  myDislikedUsersHandler,
  myBlokingUsersHandler,
} from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { isAuth } from '../middlewares/isAuth.middleware';
import { restrictTo } from '../controllers/auth.controller';
import { uploadMiddleware } from '../middlewares/fileUpload.middleware';

const userRoutes = Router();

userRoutes.get('/', isAuth, restrictTo('ADMIN'), getAllUsersHandler);

userRoutes.get('/profile-viewers', isAuth, profileViewersHandler);

userRoutes.get('/liked-posts', isAuth, myLikedUsersHandler);

userRoutes.get('/disliked-posts', isAuth, myDislikedUsersHandler);

userRoutes.get('/blocking-users', isAuth, myBlokingUsersHandler);

userRoutes.get('/:userId', isAuth, oneUserHandler);

userRoutes.get('/following/:userId', isAuth, followerUserHandler);

userRoutes.get('/followers/:userId', isAuth, userFollowersHandler);

userRoutes.get('/followings/:userId', isAuth, userFollowingsHandler);

userRoutes.get('/unfollowing/:userId', isAuth, unFollowerUserHandler);

userRoutes.get('/blocking/:userId', isAuth, blockUserHandler);

userRoutes.get('/unblocking/:userId', isAuth, unBlockUserHandler);

userRoutes.put('/admin-block/:userId', isAuth, restrictTo('ADMIN'), adminBlockUserHandler);

userRoutes.put('/admin-unblock/:userId', isAuth, restrictTo('ADMIN'), adminUnBlockUserHandler);

userRoutes.put(
  '/',
  isAuth,
  uploadMiddleware('profilePhoto'),
  validate(updateUserSchema),
  updateUserInfoHandler,
);

userRoutes.put(
  '/change-password',
  isAuth,
  validate(updatePasswordSchema),
  changeUserPasswordHandler,
);

userRoutes.post('/forgot-password', isAuth, forgotPasswordHandler);

userRoutes.put('/reset-password/:resetToken', isAuth, resetPasswordHandler);

userRoutes.delete('/delete-account', isAuth, deleteAccountHanlder);

export default userRoutes;
