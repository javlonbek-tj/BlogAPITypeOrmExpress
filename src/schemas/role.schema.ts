import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    value: z
      .string({
        required_error: 'Role value is required',
        invalid_type_error: 'Role must be a string',
      })
      .trim()
      .min(1, { message: "Role value can't be empty" }),
    description: z
      .string({
        required_error: 'Role description is required',
        invalid_type_error: 'Role description must be a string',
      })
      .trim()
      .min(1, { message: "Role description can't be empty" }),
  }),
});

const params = {
  params: z.object({
    roleId: z.string(),
  }),
};

export const getRoleSchema = z.object({
  ...params,
});

export const updateRoleSchema = z.object({
  body: z.object({
    value: z
      .string({
        invalid_type_error: 'Role value must be a string',
      })
      .trim()
      .min(1, { message: "Role value can't be empty" })
      .optional(),
    description: z
      .string({
        invalid_type_error: 'Role description must be a string',
      })
      .trim()
      .min(1, { message: "Role description can't be empty" })
      .optional(),
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>['body'];

export type GetRoleInput = z.infer<typeof getRoleSchema>['params'];

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>['body'];
