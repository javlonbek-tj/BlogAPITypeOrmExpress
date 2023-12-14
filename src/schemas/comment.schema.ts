import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, { message: "Description can't be empty" }),
    postId: z.string(),
  }),
});

const params = {
  params: z.object({
    commentId: z.string(),
  }),
};

export const getCommentSchema = z.object({
  ...params,
});

export const updateCommentSchema = z.object({
  body: z.object({
    description: z
      .string({
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, { message: "Description can't be empty" })
      .optional(),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];

export type GetCommentInput = z.infer<typeof getCommentSchema>['params'];

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];
