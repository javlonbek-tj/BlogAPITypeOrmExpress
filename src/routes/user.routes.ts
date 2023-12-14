import { getUserSchema, updatePasswordSchema, updateUserSchema } from './../schemas/user.schema';
import { Router } from 'express';
import {
  adminBlockUserHandler,
  adminUnBlockUserHandler,
  blockUserHandler,
  changeUserPasswordHandler,
  deleteAccountHanlder,
  followerUserHandler,
  forgotPasswordHandler,
  oneUserHandler,
  resetPasswordHandler,
  unBlockUserHandler,
  unFollowerUserHandler,
  updateUserInfoHandler,
  profileViewersHandler,
} from '../controllers/user.controller';
import { isAuth, restrictTo } from '../middlewares/isAuth.middleware';
import { validate } from '../middlewares/validate';
import { uploadMiddleware } from '../middlewares/fileUploadMiddleware';

const userRoutes = Router();

userRoutes.get('/profile-viewers', isAuth, profileViewersHandler);

userRoutes.get('/:userId', isAuth, oneUserHandler);

userRoutes.get('/following/:userId', isAuth, followerUserHandler);

userRoutes.get('/unfollowing/:userId', isAuth, unFollowerUserHandler);

userRoutes.get('/blocking/:userId', isAuth, blockUserHandler);

userRoutes.get('/unblocking/:userId', isAuth, unBlockUserHandler);

userRoutes.put('/admin-block/:userId', isAuth, restrictTo('ADMIN'), adminBlockUserHandler);

userRoutes.put('/admin-unblock/:userId', isAuth, restrictTo('ADMIN'), adminUnBlockUserHandler);

userRoutes.put('/', isAuth, uploadMiddleware('profilePhoto'), validate(updateUserSchema), updateUserInfoHandler);

userRoutes.put('/change-password', isAuth, validate(updatePasswordSchema), changeUserPasswordHandler);

userRoutes.post('/forgot-password', isAuth, forgotPasswordHandler);

userRoutes.put('/reset-password/:resetToken', isAuth, resetPasswordHandler);

userRoutes.delete('/delete-account', isAuth, deleteAccountHanlder);

export default userRoutes;
