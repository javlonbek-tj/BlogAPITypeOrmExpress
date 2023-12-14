import { Router } from 'express';
import { activateUser, login, logout, register, reSendCode, refresh } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { createUserSchema, loginUserSchema } from '../schemas/user.schema';
import { isAuth } from '../middlewares/isAuth.middleware';

const authRoutes = Router();

authRoutes.post('/signup', validate(createUserSchema), register);
authRoutes.post('/login', validate(loginUserSchema), login);
authRoutes.patch('/resend-code', reSendCode);
authRoutes.patch('/activate', activateUser);
authRoutes.get('/refresh', refresh);
authRoutes.post('/logout', isAuth, logout);

export default authRoutes;
