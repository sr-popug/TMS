'use client';

import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/shared/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { ControllerFieldState } from 'react-hook-form';
interface Props {
  value: {
    from: Date;
    to: Date;
  };
  onChange: (value: DateRange | undefined) => void;
  fieldState: ControllerFieldState;
}
export function DatePicker({ value, onChange, fieldState }: Props) {
  return (
    <Field className='mx-auto w-60'>
      <FieldLabel className='mt-3 text-md' htmlFor='date-picker-range'>
        Дата проведения
      </FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-invalid={fieldState.invalid}
            variant='outline'
            id='date-picker-range'
            className='justify-start px-2.5 font-normal'
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {/* Читаем данные напрямую из пропса value */}
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'dd LLL', { locale: ru })} -{' '}
                  {format(value.to, 'dd LLL', { locale: ru })}
                </>
              ) : (
                format(value.from, 'dd LLL', { locale: ru })
              )
            ) : (
              <span>Выберите даты</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            locale={ru}
            mode='range'
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
