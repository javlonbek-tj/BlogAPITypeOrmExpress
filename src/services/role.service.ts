import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { CreateRoleInput, UpdateRoleInput } from '../schemas/role.schema';
import ApiError from '../utils/appError';

const roleRepo = AppDataSource.getRepository(Role);

const create = async ({ value, description }: CreateRoleInput) => {
  const roleExists = await roleRepo.findOne({ where: { value } });
  if (roleExists) {
    throw ApiError.BadRequest('Role already exists');
  }
  const role = roleRepo.create({
    value,
    description,
  });
  await role.save();
  return role;
};

const allRoles = async () => {
  const roles = await roleRepo.find();
  return roles;
};

const getRoleByValue = async (value: string) => {
  const role = await roleRepo.findOne({ where: { value } });
  if (!role) {
    throw ApiError.BadRequest('Role not Found');
  }
  return role;
};

const updateRole = async (id: string, dto: UpdateRoleInput) => {
  const role = await roleRepo.findOneBy({ id });
  if (!role) {
    throw ApiError.BadRequest('Role not Found');
  }
  const roleExists = await roleRepo.findOne({ where: { value: dto.value } });
  if (roleExists) {
    throw ApiError.BadRequest('Role already exists');
  }
  Object.assign(role, dto);
  return roleRepo.save(role);
};

const deleteRole = async (id: string) => {
  const role = await roleRepo.findOneBy({ id });
  if (!role) {
    throw ApiError.BadRequest('Role not Found');
  }
  return roleRepo.remove(role);
};

export { create, allRoles, getRoleByValue, updateRole, deleteRole };
