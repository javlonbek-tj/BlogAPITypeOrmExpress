import { In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { CreatePostInput, UpdatePostInput } from '../schemas/post.schema';
import ApiError from '../utils/appError';
import { deleteFile } from '../utils/files';
import { categoryRepo } from './category.service';
import { userRepo } from './user.service';

export const postRepo = AppDataSource.getRepository(Post);

const create = async (
  user: User,
  image: string,
  { title, description, categoryIds }: CreatePostInput,
) => {
  if (user.isBlocked) {
    throw new ApiError(403, 'Your account is blocked');
  }
  const post = postRepo.create({ title, description, image });
  post.user = user;
  const categories = await categoryRepo.findBy({
    id: In(categoryIds),
  });
  post.categories = categories;
  await postRepo.save(post);
  user.lastPostDate = new Date();
  await userRepo.save(user);
  return post;
};

const allPosts = async (user: User) => {
  const posts = await postRepo.find({ relations: ['user'] });
  const filteredPosts = posts.filter(post => {
    const isBlocked = post.user.blockingIds.includes(user.id);
    return isBlocked ? null : post;
  });
  return filteredPosts;
};

const onePost = async (postId: string, user: User) => {
  const post = await postRepo.findOne({
    where: { id: postId },
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  const isViewed = post.viewedPostUserIds.includes(user.id);
  if (isViewed) {
    return post;
  }
  post.viewedByUsers.push(user);
  await postRepo.save(post);
  return post;
};

const updatePost = async (postId: string, user: User, input: UpdatePostInput) => {
  const { title, description, categoryIds, photo } = input;
  const post = await postRepo.findOne({ where: { id: postId } });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  if (post.user.id !== user.id) {
    throw ApiError.UnauthorizedError();
  }
  if (input.categoryIds && !Array.isArray(input.categoryIds)) {
    throw ApiError.BadRequest('Invalid input: categoryIds must be an array');
  }

  if (photo) {
    post.image = photo;
    deleteFile(post.image);
  }
  if (categoryIds) {
    const categories = await categoryRepo.findBy({
      id: In(categoryIds),
    });
    post.categories = categories;
  }
  if (title) {
    post.title = title;
  }
  if (description) {
    post.description = description;
  }
  await postRepo.save(post);
  return post;
};

const deletepost = async (postId: string, user: User) => {
  const post = await postRepo.findOne({ where: { id: postId } });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  if (post.user.id === user.id || user.role.value === 'ADMIN') {
    return postRepo.remove(post);
  } else {
    throw ApiError.UnauthorizedError();
  }
};

const toggleLikes = async (postId: string, user: User) => {
  const post = await postRepo.findOne({
    where: { id: postId },
    relations: ['likedByUsers', 'disLikedByUsers'],
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }

  const isLiked = post.likedUserIds.includes(user.id);
  if (isLiked) {
    post.likedByUsers = post.likedByUsers.filter(like => like.id !== user.id);
    await postRepo.save(post);
    return post;
  }
  post.disLikedByUsers = post.disLikedByUsers.filter(dislike => dislike.id !== user.id);
  post.likedByUsers.push(user);
  await postRepo.save(post);
  return post;
};

const toggleDisLikes = async (postId: string, user: User) => {
  const post = await postRepo.findOne({
    where: { id: postId },
    relations: ['likedByUsers', 'disLikedByUsers'],
  });
  if (!post) {
    throw ApiError.BadRequest('Post not Found');
  }
  const isDisLiked = post.dislikedUserIds.includes(user.id);
  if (isDisLiked) {
    post.disLikedByUsers = post.disLikedByUsers.filter(dislike => dislike.id !== user.id);
    await postRepo.save(post);
    return post;
  }
  post.likedByUsers = post.likedByUsers.filter(like => like.id !== user.id);
  post.disLikedByUsers.push(user);
  await postRepo.save(post);
  return post;
};

export { create, allPosts, onePost, updatePost, deletepost, toggleLikes, toggleDisLikes };
