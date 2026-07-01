'use client';
import { TimeRow } from '@/entities/timerow';
import ChangeTimelines from './ChangeTimelines';

export default function TournamentTimelines({
  tournamentId,
  isAdmin,
}: {
  tournamentId: string;
  isAdmin: boolean | undefined;
}) {
  return (
    <div className='mt-3'>
      {!isAdmin && <TimeRow tournamentId={tournamentId} />}
      {isAdmin && <ChangeTimelines tournamentId={tournamentId} />}
    </div>
  );
}
