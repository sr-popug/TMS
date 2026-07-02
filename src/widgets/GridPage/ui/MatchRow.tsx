import { Trophy } from 'lucide-react';
import { Fighter } from '../types';

export default function MatchRow({
  fighter,
  isWinner,
  isFinal,
}: {
  fighter: Fighter | null;
  isWinner: boolean;
  isFinal: boolean;
}) {
  return (
    <div
      className={`text-xs rounded flex items-center gap-1 ${
        isWinner ? ' font-medium text-yellow-500' : ''
      } ${!fighter ? 'text-muted-foreground italic' : ''}`}
    >
      {fighter ? (
        <>
          <span className='truncate'>{fighter.name}</span>
          {isWinner && isFinal && (
            <Trophy className='h-3 w-3 text-yellow-500 shrink-0' />
          )}
        </>
      ) : (
        '—'
      )}
    </div>
  );
}
