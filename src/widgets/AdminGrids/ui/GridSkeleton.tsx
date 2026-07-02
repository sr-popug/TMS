import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export default function GridSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Card key={i} className='animate-pulse'>
          <CardHeader className='pb-2'>
            <Skeleton className='h-5 ' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Skeleton className='h-4' />
              <Skeleton className='h-4' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
