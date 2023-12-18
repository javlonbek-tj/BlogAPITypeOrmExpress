import { NextFunction, Request, Response } from 'express';
import * as roleService from '../services/role.service';
import {
  CreateRoleInput,
  GetRoleInput,
  UpdateRoleInput,
} from '../schemas/role.schema';

export const createRoleHandler = async (
  req: Request<{}, {}, CreateRoleInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await roleService.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: role,
    });
  } catch (e) {
    next(e);
  }
};

export const allRolesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await roleService.allRoles();
    return res.status(200).json({
      status: 'success',
      data: roles,
    });
  } catch (e) {
    next(e);
  }
};

export const getRoleByValueHandler = async (
  req: Request<GetRoleInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await roleService.getRoleByValue(req.params.roleId);
    return res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (e) {
    next(e);
  }
};

export const updateRoleHandler = async (
  req: Request<GetRoleInput, {}, UpdateRoleInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await roleService.updateRole(req.params.roleId, req.body);
    return res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteRoleHandler = async (
  req: Request<GetRoleInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    await roleService.deleteRole(req.params.roleId);
    return res.status(204).json({
      status: 'success',
      message: 'role has been deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};
