import { Skeleton } from '@/shared/ui/skeleton';

export default function TimeRowSkeleton() {
  return (
    <div className='mb-10'>
      {[1, 2, 3, 4, 5].map(el => {
        return (
          <div
            className='flex lg:flex-row py-4
						gap-5'
            key={el}
          >
            <Skeleton className='w-30 h-4 rounded-full' />
            <Skeleton className='w-60 h-4 rounded-full' />
          </div>
        );
      })}
    </div>
  );
}
