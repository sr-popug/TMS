'use client';

import { MatchWithRelations as Match } from '@/entities/match';
import ChangeTatamiCount from './ChangeTatamiCount';
import Tatami from './Tatami';

interface Props {
  tournamentId: string;
  initialMatches: Match[];
}

export default function MatchList({
  tournamentId,
  initialMatches = [],
}: Props) {
  const matchesByTatami = initialMatches.reduce(
    (acc, match) => {
      if (!match.tatami) return acc;
      if (!acc[match.tatami]) acc[match.tatami] = [];
      acc[match.tatami].push(match);
      return acc;
    },
    {} as Record<number, Match[]>,
  );

  Object.keys(matchesByTatami).forEach(t => {
    matchesByTatami[Number(t)].sort(
      (a, b) => (a.slotNumber || 0) - (b.slotNumber || 0),
    );
  });

  const tatamiNumbers = Object.keys(matchesByTatami)
    .map(Number)
    .sort((a, b) => a - b);
  const unassignedMatches = initialMatches.filter(m => !m.tatami);

  const gridColsClass =
    tatamiNumbers.length === 1
      ? 'grid-cols-1'
      : tatamiNumbers.length === 2
        ? 'grid-cols-2'
        : tatamiNumbers.length === 3
          ? 'grid-cols-3'
          : 'grid-cols-4';

  return (
    <div className='space-y-6 p-4 w-full'>
      <ChangeTatamiCount tournamentId={tournamentId} />

      {tatamiNumbers.length > 0 && (
        <div className={`grid ${gridColsClass} gap-6 w-full items-start`}>
          {tatamiNumbers.map(tatami => {
            return (
              <Tatami
                tournamentId={tournamentId}
                initialMatches={initialMatches}
                matchesByTatami={matchesByTatami}
                tatami={tatami}
                key={tatami}
              />
            );
          })}
        </div>
      )}
      {tatamiNumbers.length == 0 && (
        <div className='text-center py-12 border border-dashed rounded-xl bg-muted/20'>
          <p className='text-sm text-muted-foreground'>
            Поединки еще не распределены по коврам.
          </p>
        </div>
      )}

      {/* 3. КОНТРОЛЬ НЕРАСПРЕДЕЛЕННЫХ МАТЧЕЙ */}
      {unassignedMatches.length > 0 && tatamiNumbers.length > 0 && (
        <div className='p-4 border border-warning/30 bg-warning/5 text-warning-foreground rounded-xl max-w-md'>
          <h5 className='text-xs font-bold uppercase tracking-wider text-amber-500'>
            ⚠️ Внимание
          </h5>
          <p className='text-xs text-muted-foreground mt-1'>
            Осталось <strong>{unassignedMatches.length}</strong>{' '}
            нераспределенных поединков.
          </p>
        </div>
      )}
    </div>
  );
}
