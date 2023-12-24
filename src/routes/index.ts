import { Router } from 'express';
import authRoutes from './auth.routes';
import roleRoutes from './role.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';

const api = Router();

api.use('/auth', authRoutes);
api.use('/roles', roleRoutes);
api.use('/users', userRoutes);
api.use('/categories', categoryRoutes);
api.use('/posts', postRoutes);
api.use('/comments', commentRoutes);

export default api;
