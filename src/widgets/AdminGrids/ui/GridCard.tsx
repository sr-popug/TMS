import { generateGrid, resetGrid } from '@/entities/grid';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader2, RefreshCw, Swords, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { GridInfo } from '../types';
interface Props {
  grid: GridInfo;
  loadGrids: () => void;
  tournamentId: string;
}
export default function GridCard({ grid, loadGrids, tournamentId }: Props) {
  const [generating, setGenerating] = useState<string | null>(null);
  const handleReset = async (categoryId: string) => {
    try {
      await resetGrid(categoryId);
      toast.success('Сетка сброшена');
      loadGrids();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при сбросе';
      toast.error(message);
    }
  };
  const handleGenerate = async (categoryId: string) => {
    setGenerating(categoryId);
    try {
      await generateGrid(categoryId);
      toast.success('Сетка сгенерирована');
      loadGrids();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при генерации';
      toast.error(message);
    } finally {
      setGenerating(null);
    }
  };
  return (
    <Card className='hover:shadow-md transition-shadow group'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base  flex items-center justify-between'>
          <span className='truncate'>{grid.categoryLabel}</span>
          <div className='flex items-center gap-2 text-primary-custom'>
            <span>{grid.fightersCount} </span>
            <Users className='h-4 w-4' />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 pt-1'>
          {!grid.hasMatches ? (
            <Button
              size='sm'
              className='w-full'
              onClick={() => handleGenerate(grid.categoryId)}
              disabled={generating === grid.categoryId}
            >
              {generating === grid.categoryId ? (
                <Loader2 className='h-4 w-4 animate-spin mr-1' />
              ) : (
                <Swords className='h-4 w-4 mr-1' />
              )}
              Сгенерировать
            </Button>
          ) : (
            <>
              <Link
                href={`/admin/tournaments/${tournamentId}/grids/${grid.categoryId}?label=${grid.categoryLabel}`}
                className='flex-1 text-center block bg-ghost border-outline rounded-sm border py-1'
              >
                Открыть
              </Link>
              <Button
                title='Перезагрузить данные'
                size='sm'
                variant='ghost'
                className='text-destructive hover:text-destructive'
                onClick={() => handleReset(grid.categoryId)}
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
