import { create } from 'zustand';

import { Category, CreateCategoryInput } from '@/types/category';
import { categoryRepository } from '@/db/repositories/category-repository';
import { handleError } from '@/utils/error-handler';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: (userId: string) => Promise<void>;
  addCategory: (userId: string, data: CreateCategoryInput) => Promise<void>;
  updateCategory: (id: string, data: Partial<CreateCategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await categoryRepository.findAll(userId);
      set({ categories: data as Category[], isLoading: false });
    } catch (error) {
      handleError(error);
      set({ isLoading: false });
    }
  },

  addCategory: async (userId, data) => {
    try {
      await categoryRepository.create(userId, data);
      await get().fetchCategories(userId);
    } catch (error) {
      handleError(error);
    }
  },

  updateCategory: async (id, data) => {
    try {
      await categoryRepository.update(id, data);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
    } catch (error) {
      handleError(error);
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryRepository.delete(id);
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
    } catch (error) {
      handleError(error);
    }
  },
}));
