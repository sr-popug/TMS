import { Skeleton } from '@/shared/ui/skeleton';

export default function TableSkeleton() {
  return (
    <div className='mb-10'>
      {[1, 2, 3, 4, 5].map(el => {
        return (
          <div
            className='flex flex-col lg:flex-row py-4
						gap-5  border-b justify-between'
            key={el}
          >
            <div className='flex gap-20'>
              <Skeleton className='w-20 h-4 rounded-full' />
              <Skeleton className='w-40 h-4 rounded-full' />
            </div>
            <Skeleton className='w-60 h-4 rounded-full' />
          </div>
        );
      })}
    </div>
  );
}
