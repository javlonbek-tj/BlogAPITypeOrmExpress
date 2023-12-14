import { CreateCommentInput, UpdateCommentInput } from '../schemas/comment.schema';
import ApiError from '../utils/appError';
import db from '../utils/db';
import { getUserSelectFields } from '../utils/getSelectedField';

const create = async (userId: string, { description, postId }: CreateCommentInput) => {
  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      author: {
        select: {
          blockings: true,
        },
      },
    },
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  // Check if the author of the post blocked current user
  const blockings = post.author.blockings.map(blocking => blocking.id);
  const isBlocked = blockings.includes(userId);
  if (isBlocked) {
    throw new ApiError(403, `You can not leave a comment to this post. You are blocked by the author of the post.`);
  }
  const comment = await db.comment.create({
    data: {
      description,
      postId,
      userId,
    },
    include: {
      post: true,
      user: {
        select: getUserSelectFields(),
      },
    },
  });
  return comment;
};

const allComments = (postId: string) => {
  return db.comment.findMany({
    where: { postId: postId },
    include: {
      user: {
        select: getUserSelectFields(),
      },
    },
  });
};

const updateComment = async (userId: string, commentId: string, { description }: UpdateCommentInput) => {
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw ApiError.BadRequest('Comment not Found');
  }
  if (userId !== comment.userId) {
    throw ApiError.UnauthorizedError();
  }
  return await db.comment.update({
    where: { id: commentId },
    data: {
      description,
    },
    include: {
      user: {
        select: getUserSelectFields(),
      },
    },
  });
};

const deleteComment = async (userId: string, commentId: string) => {
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw ApiError.BadRequest('Comment not Found');
  }
  if (userId !== comment.userId) {
    throw ApiError.UnauthorizedError();
  }
  await db.comment.delete({ where: { id: commentId } });
};

export { create, allComments, deleteComment, updateComment };
