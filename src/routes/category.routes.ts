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
import { isAuth, restrictTo } from '../middlewares/isAuth.middleware';

const categoryRoutes = Router();

categoryRoutes.use(isAuth, restrictTo('ADMIN', 'EDITOR'));

categoryRoutes.route('/').post(validate(createCategorySchema), createCategoryHandler).get(allCategoriesHandler);

categoryRoutes
  .route('/:categoryId')
  .get(oneCategoryHandler)
  .put(validate(updateCategorySchema), updateCategoryHandler)
  .delete(deleteCategoryHandler);

export default categoryRoutes;
