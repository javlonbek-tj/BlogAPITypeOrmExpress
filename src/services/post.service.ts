import { CreatePostInput, UpdatePostInput } from '../schemas/post.schema';
import ApiError from '../utils/appError';
import db from '../utils/db';
import { deleteFile } from '../utils/deleteFile';
import { getLikesDislikesInclude, getPostInclude, getUserSelectFields } from '../utils/getSelectedField';

const create = async (authorId: string, photo: string, { title, description, categories }: CreatePostInput) => {
  const user = await db.user.findUnique({ where: { id: authorId } });
  if (user?.isBlocked) {
    throw new ApiError(403, 'Your account is blocked');
  }
  const post = await db.post.create({
    data: {
      title,
      description,
      photo,
      authorId,
      category: {
        connect: categories.map(category => ({ id: category })),
      },
    },
  });
  await db.user.update({
    where: { id: authorId },
    data: {
      lastPostDate: new Date(),
    },
  });
  return post;
};

const allPosts = async (userId: string) => {
  const posts = await db.post.findMany({
    include: {
      author: {
        select: getUserSelectFields(),
      },
      likes: {
        select: {
          id: true,
        },
      },
      dislikes: {
        select: {
          id: true,
        },
      },
      numViews: {
        select: {
          id: true,
        },
      },
      comments: {
        select: {
          id: true,
        },
      },
      category: {
        select: {
          title: true,
        },
      },
    },
  });
  const filteredPosts = posts.filter(post => {
    const blockingUsers = post.author.blockings.map(blocking => blocking.id);
    const isBlocked = blockingUsers.includes(userId);
    return isBlocked ? null : post;
  });
  return filteredPosts;
};

const onePost = async (postId: string, userId: string) => {
  const post = await db.post.findUnique({
    where: { id: postId },
    include: getPostInclude(),
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  const viewers = post.numViews.map(viewer => viewer.id);
  const isViewed = viewers.includes(userId);
  if (isViewed) {
    return post;
  }
  const updatedPost = await db.post.update({
    where: { id: postId },
    data: {
      numViews: {
        connect: { id: userId },
      },
    },
    include: getPostInclude(),
  });
  return updatedPost;
};

const updatePost = async (postId: string, userId: string, input: UpdatePostInput) => {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  if (post.authorId !== userId) {
    throw ApiError.UnauthorizedError();
  }

  const dataToUpdate: UpdatePostInput = {};

  if (input.title !== undefined) {
    dataToUpdate.title = input.title;
  }

  if (input.description !== undefined) {
    dataToUpdate.description = input.description;
  }

  if (input.photo !== undefined) {
    dataToUpdate.photo = input.photo;
    deleteFile(post.photo);
  }

  if (input.categories !== undefined) {
    dataToUpdate.categories = input.categories;
  }
  return db.post.update({
    where: { id: postId },
    data: dataToUpdate,
  });
};

const deletepost = async (postId: string, userId: string) => {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  const user = await db.user.findUnique({ where: { id: userId } });
  if (post.authorId === userId || user?.role === 'ADMIN') {
    return db.post.delete({ where: { id: postId } });
  } else {
    throw ApiError.UnauthorizedError();
  }
};

const toggleLikes = async (postId: string, userId: string) => {
  const post = await db.post.findUnique({
    where: { id: postId },
    include: getLikesDislikesInclude(),
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  const likes = post.likes.map(like => like.id);
  const isLiked = likes.includes(userId);
  if (isLiked) {
    const updatePost = await db.post.update({
      where: { id: postId },
      data: {
        likes: {
          disconnect: { id: userId },
        },
      },
      include: getLikesDislikesInclude(),
    });
    return updatePost;
  }
  return await db.post.update({
    where: { id: postId },
    data: {
      likes: {
        connect: { id: userId },
      },
      dislikes: {
        disconnect: { id: userId },
      },
    },
    include: getLikesDislikesInclude(),
  });
};

const toggleDisLikes = async (postId: string, userId: string) => {
  const post = await db.post.findUnique({
    where: { id: postId },
    include: getLikesDislikesInclude(),
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  const disLikes = post.dislikes.map(dislike => dislike.id);
  const isDisLiked = disLikes.includes(userId);
  if (isDisLiked) {
    const updatePost = await db.post.update({
      where: { id: postId },
      data: {
        dislikes: {
          disconnect: { id: userId },
        },
      },
      include: getLikesDislikesInclude(),
    });
    return updatePost;
  }
  return await db.post.update({
    where: { id: postId },
    data: {
      dislikes: {
        connect: { id: userId },
      },
      likes: {
        disconnect: { id: userId },
      },
    },
    include: getLikesDislikesInclude(),
  });
};

export { create, allPosts, onePost, updatePost, deletepost, toggleLikes, toggleDisLikes };
