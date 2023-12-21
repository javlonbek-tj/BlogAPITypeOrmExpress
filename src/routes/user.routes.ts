import {
  getUserSchema,
  updatePasswordSchema,
  updateUserSchema,
} from './../schemas/user.schema';
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
} from '../controllers/user.controller';
/* import { passport.authenticate('jwt', { session: false }), restrictTo } from '../middlewares/passport.authenticate('jwt', { session: false }).middleware'; */
import { validate } from '../middlewares/validate';
import passport from 'passport';
/* import { uploadMiddleware } from '../middlewares/fileUploadMiddleware'; */

const userRoutes = Router();

userRoutes.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getAllUsersHandler
);

userRoutes.get(
  '/profile-viewers',
  passport.authenticate('jwt', { session: false }),
  profileViewersHandler
);

userRoutes.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  oneUserHandler
);

userRoutes.get(
  '/following/:userId',
  passport.authenticate('jwt', { session: false }),
  followerUserHandler
);

userRoutes.get(
  '/unfollowing/:userId',
  passport.authenticate('jwt', { session: false }),
  unFollowerUserHandler
);

userRoutes.get(
  '/blocking/:userId',
  passport.authenticate('jwt', { session: false }),
  blockUserHandler
);

userRoutes.get(
  '/unblocking/:userId',
  passport.authenticate('jwt', { session: false }),
  unBlockUserHandler
);

userRoutes.put(
  '/admin-block/:userId',
  passport.authenticate('jwt', { session: false }),
  restrictTo('ADMIN'),
  adminBlockUserHandler
);

userRoutes.put(
  '/admin-unblock/:userId',
  passport.authenticate('jwt', { session: false }),
  restrictTo('ADMIN'),
  adminUnBlockUserHandler
);

userRoutes.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  uploadMiddleware('profilePhoto'),
  validate(updateUserSchema),
  updateUserInfoHandler
);

userRoutes.put(
  '/change-password',
  passport.authenticate('jwt', { session: false }),
  validate(updatePasswordSchema),
  changeUserPasswordHandler
);

userRoutes.post(
  '/forgot-password',
  passport.authenticate('jwt', { session: false }),
  forgotPasswordHandler
);

userRoutes.put(
  '/reset-password/:resetToken',
  passport.authenticate('jwt', { session: false }),
  resetPasswordHandler
);

userRoutes.delete(
  '/delete-account',
  passport.authenticate('jwt', { session: false }),
  deleteAccountHanlder
);

export default userRoutes;
