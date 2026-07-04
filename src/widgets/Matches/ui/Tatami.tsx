import { MatchWithRelations } from '@/entities/match';
import Match from './Match';

interface Props {
  tatami: number;
  matchesByTatami: Record<number, MatchWithRelations[]>;
  initialMatches: MatchWithRelations[];
  tournamentId: string;
}

export default function Tatami({
  tatami,
  matchesByTatami,
  tournamentId,
  initialMatches,
}: Props) {
  const currentMatches = matchesByTatami[tatami];
  return (
    <div
      key={tatami}
      className='flex flex-col items-center bg-card rounded-xl border shadow-xs p-4 w-full dark:bg-zinc-900/20'
    >
      <div className='w-full text-center pb-3 border-b mb-4'>
        <h4 className='font-bold text-sm text-foreground tracking-wide'>
          КОВЕР {tatami}
        </h4>
        <span className='text-xs text-muted-foreground'>
          Всего боев: {currentMatches.length}
        </span>
      </div>

      <div className='flex flex-col gap-3 w-full'>
        {currentMatches.map(match => {
          return (
            <Match
              match={match}
              key={match.id}
              tournamentId={tournamentId}
              initialMatches={initialMatches}
            />
          );
        })}
      </div>
    </div>
  );
}
