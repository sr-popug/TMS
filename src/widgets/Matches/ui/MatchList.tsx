'use client';

import { scheduleMatches, setMatchWinner } from '@/entities/match';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { FighterWithRelations } from '@/widgets/AdminFighters/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link'; // 🎯 Импортируем линк для перехода на сетку
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface Category {
  id: string;
  age: string;
  weight: string;
}

interface Match {
  id: string;
  round: number;
  number: number;
  tatami: number | null;
  slotNumber: number | null;
  fighter1: FighterWithRelations | null;
  fighter2: FighterWithRelations | null;
  winner: number | null;
  category: Category | null;
  categoryId: string | null;
}

interface Props {
  tournamentId: string;
  initialMatches: Match[];
}

export default function MatchList({
  tournamentId,
  initialMatches = [],
}: Props) {
  const [tatamiInput, setTatamiInput] = useState('2');
  const [isPending, startTransition] = useTransition();
  const [isWinnerPending, startWinnerTransition] = useTransition();
  const router = useRouter();

  // 1. Группировка матчей по коврам
  const matchesByTatami = initialMatches.reduce(
    (acc, match) => {
      if (!match.tatami) return acc;
      if (!acc[match.tatami]) acc[match.tatami] = [];
      acc[match.tatami].push(match);
      return acc;
    },
    {} as Record<number, Match[]>,
  );

  // Сортировка по слотам внутри ковра
  Object.keys(matchesByTatami).forEach(t => {
    matchesByTatami[Number(t)].sort(
      (a, b) => (a.slotNumber || 0) - (b.slotNumber || 0),
    );
  });

  const tatamiNumbers = Object.keys(matchesByTatami)
    .map(Number)
    .sort((a, b) => a - b);
  const unassignedMatches = initialMatches.filter(m => !m.tatami);

  // 2. Хелпер для динамического вычисления названия раунда
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

  // 3. Обработчик клика по бойцу для выбора победителя
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

  const handleSchedule = () => {
    const count = parseInt(tatamiInput);
    if (isNaN(count) || count < 1) {
      toast.error('Введите корректное количество ковров (минимум 1)');
      return;
    }

    startTransition(async () => {
      try {
        await scheduleMatches(tournamentId, count);
        toast.success('Матчи успешно распределены по коврам!');
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Ошибка генерации');
      }
    });
  };

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
      {/* 1. ПАНЕЛЬ ГЕНЕРАЦИИ */}
      <div className='flex items-end gap-3 p-4 border rounded-xl bg-card max-w-xl shadow-xs'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-medium text-muted-foreground'>
            Количество ковров / татами
          </label>
          <Input
            type='number'
            min={1}
            max={10}
            value={tatamiInput}
            onChange={e => setTatamiInput(e.target.value)}
            className='w-48'
            disabled={isPending}
          />
        </div>
        <Button
          onClick={handleSchedule}
          disabled={isPending}
          className='font-medium'
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Распределение...
            </>
          ) : (
            'Распределить поединки'
          )}
        </Button>
      </div>

      {/* 2. СЕТКА ТАЙМЛАЙНА ПО КОВРАМ */}
      {tatamiNumbers.length > 0 ? (
        <div className={`grid ${gridColsClass} gap-6 w-full items-start`}>
          {tatamiNumbers.map(tatami => {
            const currentMatches = matchesByTatami[tatami];

            return (
              <div
                key={tatami}
                className='flex flex-col items-center bg-card rounded-xl border shadow-xs p-4 w-full bg-zinc-900/5 dark:bg-zinc-900/20'
              >
                {/* Шапка ковра */}
                <div className='w-full text-center pb-3 border-b mb-4'>
                  <h4 className='font-bold text-sm text-foreground tracking-wide'>
                    КОВЕР {tatami}
                  </h4>
                  <span className='text-xs text-muted-foreground'>
                    Всего боев: {currentMatches.length}
                  </span>
                </div>

                {/* Список боев на текущем ковре */}
                <div className='flex flex-col gap-3 w-full'>
                  {currentMatches.map(match => {
                    return (
                      <div
                        key={match.id}
                        className='relative border rounded-lg bg-background p-3 flex flex-col justify-between group hover:border-primary/60 hover:shadow-xs transition-all duration-200 w-full'
                      >
                        {/* Информационная плашка над боем */}
                        <div className='flex justify-between items-center text-sm font-semibold text-muted-foreground mb-2'>
                          <span className='bg-zinc-100 dark:bg-zinc-800 text-foreground px-1.5 py-0.5 rounded font-bold '>
                            Бой №{match.slotNumber}
                          </span>
                          <span className='bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium'>
                            {getRoundLabel(match.round, match.categoryId)}
                          </span>
                        </div>

                        {/* Интерактивные строки выбора победителя по клику */}
                        <div className='space-y-1.5 text-base font-medium'>
                          {/* Боец 1 */}
                          <div
                            onClick={() =>
                              handleSelectWinner(
                                match.id,
                                match.fighter1?.id,
                                match.fighter2?.id,
                              )
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
                              handleSelectWinner(
                                match.id,
                                match.fighter2?.id,
                                match.fighter1?.id,
                              )
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
                              {match.category.age} | {match.category.weight} кг
                              →
                            </Link>
                          ) : (
                            <span className='text-[10px] text-muted-foreground font-medium'>
                              Без кат.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
