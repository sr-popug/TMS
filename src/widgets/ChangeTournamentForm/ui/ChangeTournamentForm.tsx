'use client';
import { changeTournament } from '@/entities/tournament';
import { Tournament } from '@/shared/lib/prisma/client';
import { useLoadingStore } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { DatePicker } from './DatePicker';
import InfoEditor from './InfoEditor';

const formSchema = z.object({
  name: z.string().min(5, 'Минимальная длинна названия турнира 5 символов'),
  description: z.string(),
  place: z
    .string()
    .min(5, 'Минимальная длинна названия места проведения 5 символов'),
  info: z.string(),

  date: z.object(
    {
      from: z.date(),
      to: z.date(),
    },
    'Выберите период проведения',
  ),
});
type formInterface = z.infer<typeof formSchema>;

export default function ChangeTournamentForm({
  tournament,
}: {
  tournament: Tournament;
}) {
  const { showLoading, hideLoading } = useLoadingStore();
  const router = useRouter();
  const { handleSubmit, control } = useForm<formInterface>({
    defaultValues: {
      name: tournament.name,
      description: tournament.description || '',
      place: tournament.place,
      date: { from: tournament.startDate, to: tournament.endDate || undefined },
      info: tournament.info || '',
    },
    resolver: zodResolver(formSchema),
  });

  function submitForm(val: formInterface) {
    showLoading();
    changeTournament({
      id: tournament.id,
      name: val.name,
      place: val.place,
      description: val.description,
      info: val.info,
      startDate: val.date.from,
      endDate: val.date.to,
    })
      .then(res => {
        hideLoading();
        toast.success('Турнир успешно изменен');
        router.push('/admin');
      })
      .catch(err => {
        toast.error(err.message);
        hideLoading();
      });
  }
  return (
    <form id='form-rhf-demo' onSubmit={handleSubmit(submitForm)}>
      <FieldGroup>
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className='mt-3 text-md' htmlFor='name'>
                Название турнира
              </FieldLabel>
              <Input
                {...field}
                id='name'
                aria-invalid={fieldState.invalid}
                placeholder='Введите название турнира'
                autoComplete='off'
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='description'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className='mt-3 text-md' htmlFor='name'>
                Краткое описание турнира
                <p className='font-light text-ghost'>(необязательное поле)</p>
              </FieldLabel>
              <Textarea
                {...field}
                id='name'
                aria-invalid={fieldState.invalid}
                placeholder='Введите описание'
                autoComplete='off'
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className='flex gap-5'>
          <Controller
            name='place'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className='mt-3 text-md' htmlFor='name'>
                  Место проведения
                </FieldLabel>
                <Input
                  {...field}
                  id='name'
                  aria-invalid={fieldState.invalid}
                  placeholder='Введите место проведения (например г. Мурманск)'
                  autoComplete='off'
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='date'
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                fieldState={fieldState}
                aria-invalid={fieldState.invalid}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          name='info'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className='mt-3 text-md' htmlFor='name'>
                Основная информация о мероприятии
              </FieldLabel>
              <InfoEditor
                {...field}
                aria-invalid={fieldState.invalid}
                content={field.value}
                onChange={field.onChange}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type='submit' className='cursor-pointer mt-5 w-full'>
        Изменить
      </Button>
    </form>
  );
}
