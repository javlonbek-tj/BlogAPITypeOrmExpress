import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema';
import {
  allPostsHandler,
  createPostHandler,
  deletePostHandler,
  onePostHandler,
  toggleDIsLikesHandler,
  toggleLikesHandler,
  updatePostHandler,
} from '../controllers/post.controller';
import { isAuth, restrictTo } from '../middlewares/isAuth.middleware';
import { uploadMiddleware } from '../middlewares/fileUploadMiddleware';

const postRoutes = Router();

postRoutes.route('/').post(isAuth, uploadMiddleware('photo'), validate(createPostSchema), createPostHandler).get(isAuth, allPostsHandler);

postRoutes
  .route('/:postId')
  .get(isAuth, onePostHandler)
  .put(uploadMiddleware('photo'), validate(updatePostSchema), isAuth, updatePostHandler)
  .delete(isAuth, restrictTo('ADMIN', 'USER'), deletePostHandler);

postRoutes.put('/likes/:postId', isAuth, toggleLikesHandler);
postRoutes.put('/dislikes/:postId', isAuth, toggleDIsLikesHandler);

export default postRoutes;
