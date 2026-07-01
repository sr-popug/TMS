import { Suspense } from 'react';
import TimeRowData from './TimeRowData';
import TimeRowSkeleton from './TimeRowSkeleton';

export default function TimeRow({ tournamentId }: { tournamentId: string }) {
  return (
    <Suspense fallback={<TimeRowSkeleton />}>
      <TimeRowData tournamentId={tournamentId} />
    </Suspense>
  );
}
