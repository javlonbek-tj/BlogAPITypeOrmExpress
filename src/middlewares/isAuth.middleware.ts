// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../entities/user.entity';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err || !user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }
    req.user = user;
    return next();
  })(req, res, next);
};
