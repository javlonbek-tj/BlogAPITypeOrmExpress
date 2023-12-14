import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string',
      })
      .trim()
      .min(1, { message: "Description can't be empty" }),
  }),
});

const params = {
  params: z.object({
    categoryId: z.string(),
  }),
};

export const getCategorySchema = z.object({
  ...params,
});

export const updateCategorySchema = z.object({
  body: z.object({
    title: z
      .string({
        invalid_type_error: 'Title must be a string',
      })
      .trim()
      .min(1, { message: "Description can't be empty" })
      .optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];

export type GetCategoryInput = z.infer<typeof getCategorySchema>['params'];

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
