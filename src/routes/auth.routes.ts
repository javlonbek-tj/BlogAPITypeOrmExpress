import { Router } from 'express';
import {
  activateUser,
  login,
  /* logout, */
  register,
  reSendCode,
  /* refresh, */
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { createUserSchema, loginUserSchema } from '../schemas/user.schema';

const authRoutes = Router();

authRoutes.post('/signup', validate(createUserSchema), register);
authRoutes.post('/signin', validate(loginUserSchema), login);
authRoutes.patch('/resend-code', reSendCode);
authRoutes.patch('/activate', activateUser);
/* authRoutes.get('/refresh', refresh); */
/* authRoutes.post('/logout', logout); */

export default authRoutes;
