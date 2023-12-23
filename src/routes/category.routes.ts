import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import {
  allCategoriesHandler,
  createCategoryHandler,
  deleteCategoryHandler,
  oneCategoryHandler,
  updateCategoryHandler,
} from '../controllers/category.controller';
import { isAuth } from '../middlewares/isAuth.middleware';
import { restrictTo } from '../controllers/auth.controller';

const categoryRoutes = Router();

categoryRoutes.use(isAuth);

categoryRoutes.post(
  '/',
  restrictTo('ADMIN'),
  validate(createCategorySchema),
  createCategoryHandler,
);
categoryRoutes.get('/', allCategoriesHandler);

categoryRoutes
  .route('/:categoryId')
  .get(oneCategoryHandler)
  .put(restrictTo('ADMIN', 'EDITOR'), validate(updateCategorySchema), updateCategoryHandler)
  .delete(restrictTo('ADMIN'), deleteCategoryHandler);

export default categoryRoutes;
