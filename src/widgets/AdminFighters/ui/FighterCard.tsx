import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { Building2, Cake, Pencil, Trash2, Weight } from 'lucide-react';
import { FighterWithRelations } from '../types';

interface Props {
  fighter: FighterWithRelations;
  onEdit: (fighter: FighterWithRelations) => void;
  onDelete: (id: number) => void;
}

export default function FighterCard({ fighter, onEdit, onDelete }: Props) {
  return (
    <div className='p-3 hover:bg-muted/50 transition-colors'>
      <div className='flex justify-between items-start gap-2'>
        <div className='space-y-1 min-w-0'>
          <p className='font-medium truncate flex items-center gap-2'>
            {fighter.name}
            {fighter.category && (
              <span className='flex items-center gap-1 text-muted-foreground'>
                ({fighter.category.age} / {fighter.category.weight} кг)
              </span>
            )}
          </p>
          <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
            {fighter.club && (
              <span className='flex items-center gap-1'>
                <Building2 className='h-3 w-3 shrink-0' />
                {fighter.club.title}
              </span>
            )}
            <span className='flex items-center gap-1'>
              <Weight className='h-3 w-3 shrink-0' />
              {fighter.weight} кг
            </span>

            {fighter.birthday && (
              <span className='flex items-center gap-1'>
                <Cake className='h-3 w-3 shrink-0' />
                {format(new Date(fighter.birthday), 'dd.MM.yyyy')}
              </span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-0.5 shrink-0'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => onEdit(fighter)}
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 text-destructive hover:text-destructive'
            onClick={() => onDelete(fighter.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
