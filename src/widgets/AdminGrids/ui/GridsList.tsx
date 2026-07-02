'use client';
import { getGrids, reloadAllGrids } from '@/entities/grid';
import { useLoadingStore } from '@/shared/model';
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
import { Input } from '@/shared/ui/input';
import { Search, Swords, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GridInfo } from '../types';
import GridCard from './GridCard';
import GridSkeleton from './GridSkeleton';
export default function GridsList({ tournamentId }: { tournamentId: string }) {
  const [grids, setGrids] = useState<GridInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { showLoading, hideLoading } = useLoadingStore();
  const [search, setSearch] = useState('');

  const loadGrids = useCallback(() => {
    getGrids(tournamentId).then(data => {
      setGrids(data);
      setLoading(false);
    });
  }, [tournamentId]);

  useEffect(() => {
    let ignore = false;

    getGrids(tournamentId).then(data => {
      if (!ignore) {
        setGrids(data);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [tournamentId]);

  const handleReloadAll = async () => {
    showLoading('Генерация...');
    try {
      await reloadAllGrids(tournamentId);
      toast.success('Все сетки сгенерированы');
      loadGrids();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при генерации';
      toast.error(message);
    } finally {
      hideLoading();
    }
  };

  const filtered = grids.filter(g =>
    g.categoryLabel.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <GridSkeleton />;
  }

  return (
    <div className='space-y-4'>
      <div className='flex gap-2 flex-wrap items-center justify-between'>
        <div className='relative max-w-sm'>
          <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Поиск по категории...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-8'
          />
        </div>

        {grids.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='sm'>
                <Swords className='h-4 w-4 mr-1' />
                Перезагрузить все сетки
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие удалит все результаты спортсменов безвозвратно
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleReloadAll}>
                  Продолжить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {!grids.length ? (
        <div className='text-center py-12 text-muted-foreground'>
          <Trophy className='h-12 w-12 mx-auto mb-3 opacity-50' />
          <p className='text-lg font-medium'>
            Нет категорий для генерации сеток
          </p>
          <p className='text-sm'>Добавьте бойцов в категории</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          <Search className='h-12 w-12 mx-auto mb-3 opacity-50' />
          <p>Ничего не найдено</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map(grid => (
            <GridCard
              tournamentId={tournamentId}
              loadGrids={loadGrids}
              key={grid.categoryId}
              grid={grid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
