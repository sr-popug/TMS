import { scheduleMatches } from '@/entities/match';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export default function ChangeTatamiCount({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const [tatamiInput, setTatamiInput] = useState('2');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSchedule = () => {
    const count = parseInt(tatamiInput);
    if (isNaN(count) || count < 1) {
      toast.error('Введите корректное количество ковров (минимум 1)');
      return;
    }

    startTransition(async () => {
      try {
        await scheduleMatches(tournamentId, count);
        toast.success('Матчи успешно распределены по коврам!');
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Ошибка генерации');
      }
    });
  };

  return (
    <div className='flex items-end gap-3 p-4 border rounded-xl bg-card max-w-xl shadow-xs'>
      <div className='flex flex-col gap-1.5'>
        <label className='text-xs font-medium text-muted-foreground'>
          Количество ковров / татами
        </label>
        <Input
          type='number'
          min={1}
          max={10}
          value={tatamiInput}
          onChange={e => setTatamiInput(e.target.value)}
          className='w-48'
          disabled={isPending}
        />
      </div>
      <Button
        onClick={handleSchedule}
        disabled={isPending}
        className='font-medium'
      >
        {isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Распределение...
          </>
        ) : (
          'Распределить поединки'
        )}
      </Button>
    </div>
  );
}
