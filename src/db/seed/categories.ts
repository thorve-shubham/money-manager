import { categories } from '../schema';
import { db } from '../client';
import { generateId } from '@/utils/id-generator';

export const SYSTEM_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', icon: '🍽️', color: '#F59E0B', type: 'expense' as const },
  { name: 'Transport', icon: '🚗', color: '#3B82F6', type: 'expense' as const },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899', type: 'expense' as const },
  { name: 'Entertainment', icon: '🎬', color: '#8B5CF6', type: 'expense' as const },
  { name: 'Health', icon: '🏥', color: '#EF4444', type: 'expense' as const },
  { name: 'Housing', icon: '🏠', color: '#14B8A6', type: 'expense' as const },
  { name: 'Utilities', icon: '⚡', color: '#F97316', type: 'expense' as const },
  { name: 'Education', icon: '📚', color: '#06B6D4', type: 'expense' as const },
  { name: 'Personal Care', icon: '💆', color: '#A78BFA', type: 'expense' as const },
  { name: 'Travel', icon: '✈️', color: '#0EA5E9', type: 'expense' as const },
  { name: 'Loan EMI', icon: '🏦', color: '#6366F1', type: 'expense' as const },
  { name: 'Credit Card Payment', icon: '💳', color: '#64748B', type: 'expense' as const },
  // Income categories
  { name: 'Salary', icon: '💰', color: '#22C55E', type: 'income' as const },
  { name: 'Freelance', icon: '💻', color: '#10B981', type: 'income' as const },
  { name: 'Investment', icon: '📈', color: '#34D399', type: 'income' as const },
  { name: 'Business', icon: '🏢', color: '#4ADE80', type: 'income' as const },
  { name: 'Gift', icon: '🎁', color: '#86EFAC', type: 'income' as const },
  // Both
  { name: 'Transfer', icon: '↔️', color: '#94A3B8', type: 'both' as const },
  { name: 'Other', icon: '📌', color: '#9CA3AF', type: 'both' as const },
];

export async function seedSystemCategories(userId: string): Promise<void> {
  const now = Date.now();
  const systemCats = SYSTEM_CATEGORIES.map((cat) => ({
    id: generateId(),
    userId,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    type: cat.type,
    isSystem: true,
    createdAt: now,
  }));

  await db.insert(categories).values(systemCats).onConflictDoNothing();
}
