'use client';
import { deleteTournament } from '@/entities/tournament';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DeleteTournament({ id }: { id: string }) {
  const router = useRouter();
  function confirm() {
    deleteTournament(id)
      .then(() => {
        toast.success('Турнир удален');
        router.push('/admin');
      })
      .catch(err => toast.error(err.message));
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='destructive'
          className='w-full py-5 mt-2 cursor-pointer text-md'
        >
          Удалить турнир
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы удалите турнир без возможности восстановления
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
