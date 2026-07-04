import { getGridMatches } from './api/getGridMatches';
import { getMatchesWithCategory } from './api/getMatchesWithCategory';
import { scheduleMatches } from './api/scheduleMatches';
import { setMatchWinner } from './api/setMatchWinner';
import { updateMatchTatami } from './api/updateMatchTatami';
import { MatchWithRelations } from './types';

export {
  getGridMatches,
  getMatchesWithCategory,
  scheduleMatches,
  setMatchWinner,
  updateMatchTatami,
};
export type { MatchWithRelations };
