import { and, eq, ne } from 'drizzle-orm';

import { generateId } from '@/utils/id-generator';
import { CreateCategoryInput } from '@/types/category';
import { db } from '../client';
import { categories } from '../schema';

export const categoryRepository = {
  async findAll(userId: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.isSystem, categories.name);
  },

  async findById(id: string) {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0] ?? null;
  },

  async create(userId: string, data: CreateCategoryInput) {
    const id = generateId();
    const now = Date.now();
    await db.insert(categories).values({
      id,
      userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
      isSystem: false,
      createdAt: now,
    });
    return id;
  },

  async update(id: string, data: Partial<CreateCategoryInput>) {
    await db.update(categories).set(data).where(and(eq(categories.id, id), ne(categories.isSystem, true)));
  },

  async delete(id: string) {
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.isSystem, false)));
  },
};
