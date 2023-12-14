import { z } from 'zod';

export enum RoleEnumType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
}

export enum AwardEnumType {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export const createUserSchema = z.object({
  body: z
    .object({
      firstname: z
        .string({
          required_error: 'Firstname is required',
          invalid_type_error: 'Firstname must be a string',
        })
        .trim()
        .min(1, { message: "Firstname can't be empty" }),
      lastname: z
        .string({
          required_error: 'Lastname is required',
          invalid_type_error: 'Lastname must be a string',
        })
        .trim()
        .min(1, { message: "Lastname can't be empty" }),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email({ message: 'Invalid email' }),
      profilPhoto: z.string().optional(),
      password: z
        .string({
          required_error: 'Password is required',
        })
        .min(8, { message: 'Password must be more than 8 characters' }),
      passwordConfirm: z.string({
        required_error: 'passwordConfirm is required',
      }),
      role: z.nativeEnum(RoleEnumType).default(RoleEnumType.USER),
    })
    .refine(data => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match',
    }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({ message: 'Invalid email' }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

const params = {
  params: z.object({
    userId: z.string(),
  }),
};

export const updateUserSchema = z.object({
  body: z.object({
    firstname: z
      .string({
        invalid_type_error: 'Firstname must be a string',
      })
      .trim()
      .min(1, { message: "Firstname can't be empty" })
      .optional(),
    lastname: z
      .string({
        invalid_type_error: 'Lastname must be a string',
      })
      .trim()
      .min(1, { message: "Firstname can't be empty" })
      .optional(),
    email: z.string().email({ message: 'Invalid email' }).optional(),
    profilPhoto: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z
    .object({
      oldPass: z.string({
        required_error: 'old Password is required',
      }),
      newPass: z
        .string({
          required_error: 'new Password is required',
        })
        .min(8, { message: 'Password must be more than 8 characters' }),
      newPassConfirm: z.string({
        required_error: 'passwordConfirm is required',
      }),
    })
    .refine(data => data.newPass === data.newPassConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match',
    }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string({
          required_error: 'new Password is required',
        })
        .min(8, { message: 'Password must be more than 8 characters' }),
      passwordCofirm: z.string({
        required_error: 'passwordConfirm is required',
      }),
    })
    .refine(data => data.password === data.passwordCofirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match',
    }),
});

export const getUserSchema = z.object({ ...params });

export type CreateUserInput = Omit<z.infer<typeof createUserSchema>['body'], 'passwordConfirm'>;

export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];

export type GetUserInput = z.infer<typeof getUserSchema>['params'];
