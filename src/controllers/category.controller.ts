import { GetCategoryInput, UpdateCategoryInput, CreateCategoryInput } from './../schemas/category.schema';
import { NextFunction, Request, Response } from 'express';
import * as categoryService from '../services/category.service';

export const createCategoryHandler = async (req: Request<{}, {}, CreateCategoryInput>, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const allCategoriesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.allCategories();
    return res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (e) {
    next(e);
  }
};

export const oneCategoryHandler = async (req: Request<GetCategoryInput>, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.oneCategory(req.params.categoryId);
    return res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const updateCategoryHandler = async (req: Request<GetCategoryInput, {}, UpdateCategoryInput>, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(req.params.categoryId, req.body);
    return res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteCategoryHandler = async (req: Request<GetCategoryInput>, res: Response, next: NextFunction) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId);
    return res.status(204).json({
      status: 'success',
      message: 'Category has been deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};
