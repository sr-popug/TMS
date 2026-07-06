import { FighterWithRelations } from '@/entities/fighter';
import { Category, Match } from '@/shared/lib/prisma/client';

export type MatchWithRelations = Match & {
  category: Category | null;
  fighter1: FighterWithRelations | null;
  fighter2: FighterWithRelations | null;
};
