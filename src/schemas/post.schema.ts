import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string',
      })
      .trim()
      .min(1, { message: "Title can't be empty" }),
    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, { message: "Description can't be empty" }),
    categories: z.array(z.string()),
  }),
});

const params = {
  params: z.object({
    postId: z.string(),
  }),
};

export const getPostSchema = z.object({
  ...params,
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z
      .string({
        invalid_type_error: 'title must be a string',
      })
      .trim()
      .min(1, { message: "Title can't be empty" })
      .optional(),
    description: z
      .string({
        invalid_type_error: 'description must be a string',
      })
      .trim()
      .min(1, { message: "Description can't be empty" })
      .optional(),
    categories: z.array(z.string()).optional(),
    photo: z.string().optional(),
  }),
});

export const deletePostSchema = z.object({
  ...params,
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];

export type GetPostInput = z.infer<typeof getPostSchema>['params'];

export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];

export type DeletePostInput = z.infer<typeof deletePostSchema>['params'];
