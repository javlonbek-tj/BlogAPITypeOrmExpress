import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { isAuth, restrictTo } from '../middlewares/isAuth.middleware';
import { createCommentSchema } from '../schemas/comment.schema';
import { createCommentHandler, deleteCommentHandler, getAllCommentsHandler, updateCommentHandler } from '../controllers/comment.controller';

const commentRoutes = Router();

commentRoutes.use(isAuth);

commentRoutes.post('/', validate(createCommentSchema), createCommentHandler);

commentRoutes.get('/:postId', getAllCommentsHandler);

commentRoutes.route('/:commentId').put(updateCommentHandler).delete(deleteCommentHandler);

export default commentRoutes;
