export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isSystem: boolean;
  createdAt: number;
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}
