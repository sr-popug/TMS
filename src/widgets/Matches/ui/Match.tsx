import { MatchWithRelations, setMatchWinner } from '@/entities/match';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
interface Props {
  initialMatches: MatchWithRelations[];
  tournamentId: string;
  match: MatchWithRelations;
}
export default function Match({ tournamentId, initialMatches, match }: Props) {
  const [isWinnerPending, startWinnerTransition] = useTransition();
  const router = useRouter();
  const getRoundLabel = (currentRound: number, categoryId: string | null) => {
    if (!categoryId) return `Раунд ${currentRound}`;

    const categoryMatches = initialMatches.filter(
      m => m.categoryId === categoryId,
    );
    const maxRound = Math.max(...categoryMatches.map(m => m.round), 1);

    if (currentRound === maxRound) return 'Финал';
    if (currentRound === maxRound - 1 && maxRound > 1) return '1/2 финала';
    if (currentRound === maxRound - 2 && maxRound > 2) return '1/4 финала';
    if (currentRound === maxRound - 3 && maxRound > 3) return '1/8 финала';

    return `${currentRound}-й круг`;
  };
  const handleSelectWinner = (
    matchId: string,
    fighterId: number | undefined,
    opponentId: number | undefined,
  ) => {
    if (!fighterId) return;
    if (isWinnerPending) return;

    startWinnerTransition(async () => {
      try {
        await setMatchWinner(matchId, fighterId);
        toast.success('Результат сохранен, сетка обновлена!');
        router.refresh();
      } catch (err) {
        toast.error('Не удалось сохранить победителя');
      }
    });
  };
  return (
    <div
      key={match.id}
      className='relative border rounded-lg bg-background p-3 flex flex-col justify-between group hover:border-primary/60 hover:shadow-xs transition-all duration-200 w-full'
    >
      <div className='flex justify-between items-center text-sm font-semibold text-muted-foreground mb-2'>
        <span className='bg-zinc-100 dark:bg-zinc-800 text-foreground px-1.5 py-0.5 rounded font-bold '>
          Бой №{match.slotNumber}
        </span>
        <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium'>
          {getRoundLabel(match.round, match.categoryId)}
        </span>
      </div>

      <div className='space-y-1.5 text-base font-medium'>
        <div
          onClick={() =>
            handleSelectWinner(match.id, match.fighter1?.id, match.fighter2?.id)
          }
          className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors
                              ${
                                match.winner === match.fighter1?.id
                                  ? 'bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/30'
                                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground'
                              } ${!match.fighter1?.id ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className='truncate'>
            {match.fighter1?.name || 'Определится позже'}
          </span>
          <span className='text-sm text-muted-foreground truncate ml-2'>
            {match.fighter1?.club?.title || ''}
          </span>
        </div>

        <div className='border-t border-dashed border-muted' />

        <div
          onClick={() =>
            handleSelectWinner(match.id, match.fighter2?.id, match.fighter1?.id)
          }
          className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors
                              ${
                                match.winner === match.fighter2?.id
                                  ? 'bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/30'
                                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground'
                              } ${!match.fighter2?.id ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className='truncate'>
            {match.fighter2?.name || 'Определится позже'}
          </span>
          <span className='text-sm text-muted-foreground truncate ml-2'>
            {match.fighter2?.club?.title || ''}
          </span>
        </div>
      </div>

      <div className='mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 truncate'>
        {match.category && match.categoryId ? (
          <Link
            href={`/admin/tournaments/${tournamentId}/grids/${match.categoryId}?label=${match.category.age} / ${match.category.weight} кг`}
            className='text-xs font-bold text-primary hover:underline inline-block'
          >
            {match.category.age} | {match.category.weight} кг →
          </Link>
        ) : (
          <span className='text-[10px] text-muted-foreground font-medium'>
            Без кат.
          </span>
        )}
      </div>
    </div>
  );
}
