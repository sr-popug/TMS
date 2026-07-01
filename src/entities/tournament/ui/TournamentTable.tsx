import { Suspense } from 'react';
import { TournamentTableProps } from '../types/TournamentTableProps';
import TableSkeleton from './TableSkeleton';
import { TournamentTableData } from './TournamentTableData';

export default function TournamentTable(props: TournamentTableProps) {
  return (
    <div className='mb-10'>
      <Suspense fallback={<TableSkeleton />}>
        <TournamentTableData {...props} />
      </Suspense>
    </div>
  );
}
