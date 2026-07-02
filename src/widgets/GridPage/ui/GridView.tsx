'use client';
import { Card, CardContent } from '@/shared/ui/card';
import { Trophy } from 'lucide-react';

interface Fighter {
  id: number;
  name: string;
  club: { title: string } | null;
}

interface Match {
  id: string;
  round: number;
  number: number;
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  winner: number | null;
}

interface Props {
  matches: Match[];
}

export default function GridView({ matches }: Props) {
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = Math.max(...rounds);

  return (
    <div className='overflow-x-auto'>
      <div className='flex gap-8 min-w-max justify-center pb-4'>
        {rounds.map(round => {
          const roundMatches = matches
            .filter(m => m.round === round)
            .sort((a, b) => a.number - b.number);

          const isFinal = round === maxRound;

          return (
            <div key={round} className='flex flex-col justify-center gap-4'>
              <div className='text-center text-sm font-medium text-muted-foreground mb-2'>
                {isFinal ? 'Финал' : `Раунд ${round}`}
              </div>
              <div
                className='flex flex-col'
                style={{ gap: `${Math.pow(2, round) * 16}px` }}
              >
                {roundMatches.map(match => (
                  <Card
                    key={match.id}
                    className={`w-48 ${isFinal ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className='p-2 space-y-1'>
                      <div
                        className={`text-sm p-1.5 rounded ${
                          match.winner === match.fighter1?.id
                            ? 'bg-primary/10 font-medium'
                            : ''
                        }`}
                      >
                        {match.fighter1 ? (
                          <div>
                            <p className='truncate'>{match.fighter1.name}</p>
                            {match.fighter1.club && (
                              <p className='text-xs text-muted-foreground truncate'>
                                {match.fighter1.club.title}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className='text-muted-foreground text-xs'>—</p>
                        )}
                      </div>

                      <div className='border-t' />

                      <div
                        className={`text-sm p-1.5 rounded ${
                          match.winner === match.fighter2?.id
                            ? 'bg-primary/10 font-medium'
                            : ''
                        }`}
                      >
                        {match.fighter2 ? (
                          <div>
                            <p className='truncate'>{match.fighter2.name}</p>
                            {match.fighter2.club && (
                              <p className='text-xs text-muted-foreground truncate'>
                                {match.fighter2.club.title}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className='text-muted-foreground text-xs'>—</p>
                        )}
                      </div>

                      {match.winner && (
                        <div className='flex items-center gap-1 text-xs text-primary pt-1'>
                          <Trophy className='h-3 w-3' />
                          Победитель
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
