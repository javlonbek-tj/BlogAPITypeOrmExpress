import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createRoleSchema, updateRoleSchema } from '../schemas/role.schema';
import {
  allRolesHandler,
  createRoleHandler,
  deleteRoleHandler,
  getRoleByValueHandler,
  updateRoleHandler,
} from '../controllers/role.controller';
/* import { isAuth, restrictTo } from '../middlewares/isAuth.middleware'; */

const roleRoutes = Router();

/* roleRoutes.use(isAuth, restrictTo('ADMIN', 'EDITOR')); */

roleRoutes
  .route('/')
  .post(validate(createRoleSchema), createRoleHandler)
  .get(allRolesHandler);

roleRoutes
  .route('/:roleId')
  .get(getRoleByValueHandler)
  .put(validate(updateRoleSchema), updateRoleHandler)
  .delete(deleteRoleHandler);

export default roleRoutes;
