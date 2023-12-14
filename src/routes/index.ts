import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';

const api = Router();

api.use('/', authRoutes);
api.use('/users', userRoutes);
api.use('/categories', categoryRoutes);
api.use('/posts', postRoutes);
api.use('/comments', commentRoutes);

export default api;
