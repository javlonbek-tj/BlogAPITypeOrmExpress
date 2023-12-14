import { NextFunction, Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { CreateCommentInput, GetCommentInput, UpdateCommentInput } from '../schemas/comment.schema';
import { GetPostInput } from '../schemas/post.schema';

export const createCommentHandler = async (req: Request<{}, {}, CreateCommentInput>, res: Response, next: NextFunction) => {
  try {
    const comment = await commentService.create(req.userId, req.body);
    return res.status(201).json({
      status: 'success',
      data: comment,
    });
  } catch (e) {
    next(e);
  }
};

export const getAllCommentsHandler = async (req: Request<GetPostInput>, res: Response, next: NextFunction) => {
  try {
    const comments = await commentService.allComments(req.params.postId);
    return res.status(200).json({
      status: 'success',
      data: comments,
    });
  } catch (e) {
    next(e);
  }
};

export const updateCommentHandler = async (req: Request<GetCommentInput, {}, UpdateCommentInput>, res: Response, next: NextFunction) => {
  try {
    const updatedComment = await commentService.updateComment(req.userId, req.params.commentId, req.body);
    return res.status(200).json({
      status: 'success',
      data: updatedComment,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteCommentHandler = async (req: Request<GetCommentInput>, res: Response, next: NextFunction) => {
  try {
    await commentService.deleteComment(req.userId, req.params.commentId);
    return res.status(204).json({
      status: 'success',
      message: 'Comment has been deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};
