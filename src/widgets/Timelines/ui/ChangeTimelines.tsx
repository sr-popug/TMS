'use client';

import { changeTimeRows, getTimeRows } from '@/entities/timerow';
import { useLoadingStore } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronDownIcon, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TimelineRow {
  id: string;
  hours: string;
  minutes: string;
  event: string;
  date: Date;
}

export default function ChangeTimelines({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { showLoading, hideLoading } = useLoadingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<TimelineRow[]>([
    {
      id: crypto.randomUUID(),
      hours: '',
      minutes: '',
      event: '',
      date: new Date(),
    },
  ]);

  useEffect(() => {
    let ignore = false;

    getTimeRows(tournamentId)
      .then(prevRows => {
        if (ignore) return;

        if (prevRows.length) {
          const newRows = prevRows.map(el => ({
            id: crypto.randomUUID(),
            hours: el.timeline.split(':')[0],
            minutes: el.timeline.split(':')[1],
            event: el.event,
            date: el.date,
          }));
          setRows(newRows);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [tournamentId]);

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        hours: '',
        minutes: '',
        event: '',
        date: prev[prev.length - 1]?.date || new Date(),
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      toast.error('Должна быть хотя бы одна строка');
      return;
    }
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (
    id: string,
    field: keyof TimelineRow,
    value: string | Date | undefined,
  ) => {
    setRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const validateRows = (): boolean => {
    const invalidRows = rows.filter(
      row => !row.event || !row.hours || !row.minutes || !row.date,
    );

    if (invalidRows.length > 0) {
      toast.error('Заполните все поля');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRows()) return;

    showLoading();

    const data = rows.map(el => ({
      date: el.date,
      event: el.event,
      timeline: `${el.hours}:${el.minutes}`,
      tournamentId,
    }));

    changeTimeRows(data)
      .then(() => {
        hideLoading();
        toast.success('Расписание успешно изменено');
      })
      .catch(err => {
        hideLoading();
        toast.error(err.message);
      });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='grid grid-cols-[172px_132px_1fr_40px] gap-2 font-bold'>
        <p className='text-center'>Дата</p>
        <p className='text-center'>Время</p>
        <p className='text-center'>Мероприятие</p>
        <div></div>
      </div>

      <div className='space-y-2 max-h-[60vh] overflow-y-auto pr-1'>
        {rows.map(row => (
          <div
            key={row.id}
            className='grid grid-cols-[172px_132px_1fr_40px] gap-2 items-center'
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  data-empty={!row.date}
                  className='w-43 justify-between text-left font-normal data-[empty=true]:text-muted-foreground'
                >
                  {row.date ? (
                    format(row.date, 'PPP', { locale: ru })
                  ) : (
                    <span>Дата</span>
                  )}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  locale={ru}
                  selected={row.date}
                  onSelect={val => updateRow(row.id, 'date', val)}
                  defaultMonth={row.date}
                />
              </PopoverContent>
            </Popover>

            <div className='flex gap-1 items-center'>
              <Select
                value={row.hours}
                onValueChange={val => updateRow(row.id, 'hours', val)}
              >
                <SelectTrigger className='w-full max-w-15'>
                  <SelectValue placeholder='Ч' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Часы</SelectLabel>
                    {Array.from({ length: 24 }, (_, i) => i).map(el => {
                      const val = String(el).padStart(2, '0');
                      return (
                        <SelectItem key={el} value={val}>
                          {val}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <span>:</span>

              <Select
                value={row.minutes}
                onValueChange={val => updateRow(row.id, 'minutes', val)}
              >
                <SelectTrigger className='w-full max-w-15'>
                  <SelectValue placeholder='М' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Минуты</SelectLabel>
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(el => {
                      const val = String(el).padStart(2, '0');
                      return (
                        <SelectItem key={el} value={val}>
                          {val}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Input
              value={row.event}
              onChange={e => updateRow(row.id, 'event', e.target.value)}
              placeholder='Название мероприятия'
              required
            />

            <Button
              type='button'
              className='cursor-pointer p-0 h-9 w-9'
              variant='destructive'
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type='button'
        onClick={addRow}
        className='cursor-pointer w-full mt-2'
        variant='outline'
      >
        <Plus className='mr-2 h-4 w-4' /> Добавить мероприятие
      </Button>

      <Button type='submit' className='cursor-pointer w-full mt-2'>
        Подтвердить
      </Button>
    </form>
  );
}
