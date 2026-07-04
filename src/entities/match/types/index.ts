import { FighterWithRelations } from '@/entities/fighter';
import { Category, Club, Match } from '@/shared/lib/prisma/client';

export type MatchWithRelations = Match & {
  club: Club | null;
  category: Category | null;
  fighter1: FighterWithRelations | null;
  fighter2: FighterWithRelations | null;
};
