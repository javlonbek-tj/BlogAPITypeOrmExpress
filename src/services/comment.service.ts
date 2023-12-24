import { AppDataSource } from '../data-source';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { CreateCommentInput, UpdateCommentInput } from '../schemas/comment.schema';
import ApiError from '../utils/appError';
import { postRepo } from './post.service';

const commentRepo = AppDataSource.getRepository(Comment);

const create = async (user: User, { description, postId }: CreateCommentInput) => {
  const post = await postRepo.findOne({ where: { id: postId }, relations: ['blockings'] });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  // Check if the author of the post blocked current user
  const isBlocked = post.user.blockingIds.includes(user.id);
  if (isBlocked) {
    throw new ApiError(
      403,
      `You can not leave a comment to this post. You are blocked by the author of the post.`,
    );
  }
  const comment = commentRepo.create({ description });
  comment.user = user;
  comment.post = post;
  await commentRepo.save(comment);
  return comment;
};

const allComments = async (postId: string) => {
  const comments = await commentRepo.find({
    where: { postId },
    relations: ['user'],
  });
  return comments;
};

const updateComment = async (
  userId: string,
  commentId: string,
  { description }: UpdateCommentInput,
) => {
  const comment = await commentRepo.findOne({ where: { id: commentId } });
  if (!comment) {
    throw ApiError.BadRequest('Comment not Found');
  }
  if (userId !== comment.userId) {
    throw ApiError.UnauthorizedError();
  }
  comment.description = description;
  await commentRepo.save(comment);
};

const deleteComment = async (user: User, commentId: string) => {
  const comment = await commentRepo.findOne({ where: { id: commentId } });
  if (!comment) {
    throw ApiError.BadRequest('Comment not Found');
  }
  if (user.id !== comment.userId || user.role.value !== 'ADMIN') {
    throw ApiError.UnauthorizedError();
  }
  await commentRepo.remove(comment);
};

export { create, allComments, deleteComment, updateComment };
