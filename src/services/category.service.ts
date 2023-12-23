import { AppDataSource } from '../data-source';
import { Category } from '../entities/category.entity';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema';
import ApiError from '../utils/appError';

const categoryRepo = AppDataSource.getRepository(Category);

const create = async ({ title }: CreateCategoryInput) => {
  const categoryExists = await categoryRepo.findOne({ where: { title } });
  if (categoryExists) {
    throw ApiError.BadRequest('Category already exists');
  }
  const category = categoryRepo.create({ title });
  await categoryRepo.save(category);
  return category;
};

const allCategories = async () => {
  const categories = await categoryRepo.find();
  return categories;
};

const oneCategory = async (id: string) => {
  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) {
    throw ApiError.BadRequest('Category not Found');
  }
  return category;
};

const updateCategory = async (id: string, { title }: UpdateCategoryInput) => {
  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) {
    throw ApiError.BadRequest('Category not Found');
  }
  const categoryExists = await categoryRepo.findOne({ where: { title } });
  if (categoryExists) {
    throw ApiError.BadRequest('Category already exists');
  }
  category.title = title;
  await categoryRepo.save(category);
  return category;
};

const deleteCategory = async (id: string) => {
  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) {
    throw ApiError.BadRequest('Category not Found');
  }
  await categoryRepo.remove(category);
  return category;
};

export { create, allCategories, oneCategory, updateCategory, deleteCategory };
