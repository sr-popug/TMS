'use client';
import { Fighter } from '../types';
import MatchRow from './MatchRow';

interface Match {
  id: string;
  round: number;
  number: number;
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  winner: number | null; // У вас в интерфейсе было number, но обычно это string (id). Поправьте, если нужно.
}

interface Props {
  matches: Match[];
}

export default function GridTree({ matches }: Props) {
  const maxRound = Math.max(...matches.map(m => m.round));

  // Базовые константы размеров
  const matchHeight = 64;
  const matchWidth = 192;
  const connectorWidth = 48;
  const baseGap = 32; // Вертикальный отступ между карточками в 1/8

  // Высота одного логического "слота" в первом раунде
  const baseSlotHeight = matchHeight + baseGap;
  const containerPadding = 60; // Отступ сверху, чтобы влезли заголовки "1/4", "Финал"

  // Рассчитываем общую высоту контейнера исходя из максимального количества слотов
  const logicalR1Slots = Math.max(
    Math.pow(2, maxRound - 1),
    matches.filter(m => m.round === 1).length, // На случай вашей круговой сетки (3 бойца)
  );
  const totalHeight = logicalR1Slots * baseSlotHeight + containerPadding * 2;

  const getRoundLabel = (round: number): string => {
    const diff = maxRound - round;
    if (diff === 0) return 'Финал';
    if (diff === 1) return '1/2';
    if (diff === 2) return '1/4';
    return `1/${Math.pow(2, diff)}`;
  };

  // 🎯 ГЛАВНАЯ ФУНКЦИЯ: Единая математика для центров карточек и линий
  const getMatchCenterY = (round: number, matchNumber: number) => {
    // В 1-м раунде множитель 1, во 2-м раунде слоты в 2 раза шире (множитель 2), в 3-м (4) и т.д.
    const multiplier = Math.pow(2, round - 1);
    const slotHeight = baseSlotHeight * multiplier;

    // Вычисляем строгий центр по номеру матча (matchNumber начинается с 1)
    const centerY = (matchNumber - 1) * slotHeight + slotHeight / 2;
    return centerY + containerPadding;
  };

  return (
    <div className='overflow-x-auto py-8'>
      <div className='flex min-w-max px-4 items-stretch'>
        {Array.from({ length: maxRound }, (_, i) => i + 1).map(round => {
          const roundMatches = matches
            .filter(m => m.round === round)
            .sort((a, b) => a.number - b.number);

          const isLast = round === maxRound;

          return (
            <div key={round} className='flex shrink-0'>
              {/* 1. КОЛОНКА С КАРТОЧКАМИ (Абсолютное позиционирование) */}
              <div
                className='relative'
                style={{ width: `${matchWidth}px`, height: `${totalHeight}px` }}
              >
                {/* Заголовок колонки */}
                <div
                  className='absolute w-full text-center'
                  style={{ top: '16px' }}
                >
                  <span className='text-xs font-medium text-muted-foreground'>
                    {getRoundLabel(round)}
                  </span>
                </div>

                {/* Рендерим матчи на жестких математических координатах */}
                {roundMatches.map(match => {
                  const centerY = getMatchCenterY(round, match.number);
                  const topPosition = centerY - matchHeight / 2; // Сдвигаем карточку вверх на половину её высоты, чтобы она была строго по центру

                  return (
                    <div
                      key={match.id}
                      className='absolute border rounded-md bg-background shadow-sm flex flex-col justify-center'
                      style={{
                        top: `${topPosition}px`,
                        width: `${matchWidth}px`,
                        height: `${matchHeight}px`,
                      }}
                    >
                      <div className='px-3 py-1'>
                        <MatchRow
                          fighter={match.fighter1}
                          isWinner={match.winner === match.fighter1?.id}
                          isFinal={isLast}
                        />
                        <div className='border-t my-0.5' />
                        <MatchRow
                          fighter={match.fighter2}
                          isWinner={match.winner === match.fighter2?.id}
                          isFinal={isLast}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. СВЯЗУЮЩИЕ SVG-ЛИНИИ (Используют те же координаты) */}
              {!isLast && (
                <div
                  className='relative'
                  style={{
                    width: `${connectorWidth}px`,
                    height: `${totalHeight}px`,
                  }}
                >
                  <svg
                    width='100%'
                    height='100%'
                    className='text-muted-foreground/30'
                  >
                    {roundMatches.map(match => {
                      // Y-Координата выхода линии из текущего матча
                      const currentCenterY = getMatchCenterY(
                        round,
                        match.number,
                      );

                      // Вычисляем в какой матч следующего раунда ведет линия (например, 1 и 2 матчи ведут в матч 1)
                      const nextRoundNumber = Math.ceil(match.number / 2);

                      // Y-Координата входа в матч следующего раунда
                      const nextCenterY = getMatchCenterY(
                        round + 1,
                        nextRoundNumber,
                      );

                      // Рисуем ломаную линию через тег <path>
                      // M (Move to) -> L (Line to горизонтально) -> L (Line to вертикально) -> L (Line to горизонтально в следующий матч)
                      return (
                        <path
                          key={match.id}
                          d={`M 0 ${currentCenterY} L ${connectorWidth / 2} ${currentCenterY} L ${connectorWidth / 2} ${nextCenterY} L ${connectorWidth} ${nextCenterY}`}
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='1.5'
                        />
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
