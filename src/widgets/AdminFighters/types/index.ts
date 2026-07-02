import { Category, Club, Fighter } from '@/shared/lib/prisma/client';

export type FighterWithRelations = Fighter & {
  club: Club | null;
  category: Category | null;
};
