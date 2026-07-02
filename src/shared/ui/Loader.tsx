'use client';

import { useLoadingStore } from '@/shared/model';

export function Loader() {
  const { isLoading, title } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='flex flex-col items-center gap-3'>
        <div className='w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin' />
        <p className='text-white font-medium'>{title}</p>
      </div>
    </div>
  );
}
