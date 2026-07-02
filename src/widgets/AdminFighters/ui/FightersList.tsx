'use client';
import { getCategories } from '@/entities/category';
import { deleteFighter, getAllFighters } from '@/entities/fighter';
import { Category } from '@/shared/lib/prisma/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  ArrowUpDown,
  Building2,
  LayoutList,
  Search,
  Weight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FighterWithRelations } from '../types';
import AddFighterForm from './AddFighterForm';
import EditFighterModal from './EditFighterModal';
import FighterCard from './FighterCard';

type ViewMode = 'list' | 'clubs' | 'categories';
type SortField = 'name' | 'club' | 'category' | 'order' | 'weight';

export default function FightersList({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const [fighters, setFighters] = useState<FighterWithRelations[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setIsLoading] = useState<boolean>(false);
  const [clubFilter, setClubFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortAsc, setSortAsc] = useState(true);
  const [clubs, setClubs] = useState<{ id: number; title: string }[]>([]);
  const [categories, setCategories] = useState<
    { id: string; age: string; weight: string; label: string }[]
  >([]);
  const [editingFighter, setEditingFighter] =
    useState<FighterWithRelations | null>(null);

  const loadFighters = () => {
    getAllFighters(tournamentId).then((data: FighterWithRelations[]) => {
      setIsLoading(true);
      setFighters(data);

      const uniqueClubs = data
        .filter(f => f.club)
        .map(f => ({ id: f.club!.id, title: f.club!.title }))
        .filter((c, i, self) => self.findIndex(t => t.id === c.id) === i)
        .sort((a, b) => a.title.localeCompare(b.title));

      setClubs(uniqueClubs);
    });

    getCategories(tournamentId).then((data: Category[]) => {
      setIsLoading(false);
      const uniqueCategories = data
        .map(c => ({
          id: c.id,
          age: c.age,
          weight: c.weight,
          label: `${c.age} / ${c.weight} кг`,
        }))
        .filter((c, i, self) => self.findIndex(t => t.id === c.id) === i)
        .sort((a, b) => {
          if (a.age !== b.age) return a.age.localeCompare(b.age);
          return parseFloat(a.weight) - parseFloat(b.weight);
        });

      setCategories(uniqueCategories);
    });
  };

  useEffect(() => {
    loadFighters();
  }, [tournamentId]);

  const handleDelete = async (id: number) => {
    try {
      await deleteFighter(id);
      toast.success('Боец удалён');
      loadFighters();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при удалении';
      toast.error(message);
    }
  };

  const handleEdit = (fighter: FighterWithRelations) => {
    setEditingFighter(fighter);
  };
  const handleClubCreated = (club: { id: number; title: string }) => {
    setClubs(prev =>
      [...prev, club].sort((a, b) => a.title.localeCompare(b.title)),
    );
  };
  const ageGroups = [...new Set(categories.map(c => c.age))].sort();

  const filtered = fighters
    .filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesClub =
        clubFilter === 'all' || f.club?.id === Number(clubFilter);
      const matchesCategory =
        categoryFilter === 'all' || f.category?.id === categoryFilter;
      return matchesSearch && matchesClub && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'club':
          comparison = (a.club?.title || '').localeCompare(b.club?.title || '');
          break;
        case 'category':
          comparison =
            (a.category?.age || '').localeCompare(b.category?.age || '') ||
            (a.category?.weight || '').localeCompare(b.category?.weight || '');
          break;
        case 'weight':
          comparison = (a.weight || 0) - (b.weight || 0);
          break;
        case 'order':
          comparison = a.order - b.order;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

  const groupedByClub = filtered.reduce<Record<string, FighterWithRelations[]>>(
    (acc, f) => {
      const key = f.club?.title || 'Без клуба';
      if (!acc[key]) acc[key] = [];
      acc[key].push(f);
      return acc;
    },
    {},
  );

  const groupedByCategory = filtered.reduce<
    Record<string, FighterWithRelations[]>
  >((acc, f) => {
    const key = f.category
      ? `${f.category.age} / ${f.category.weight} кг`
      : 'Без категории';
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className='space-y-6'>
      <AddFighterForm
        tournamentId={tournamentId}
        clubs={clubs}
        categories={categories}
        onSuccess={loadFighters}
        onClubCreated={handleClubCreated}
      />

      {editingFighter && (
        <EditFighterModal
          fighter={editingFighter}
          clubs={clubs}
          categories={categories}
          open={!!editingFighter}
          onSuccess={loadFighters}
          onClose={() => setEditingFighter(null)}
        />
      )}

      <div className='space-y-4'>
        <div className='flex gap-2 flex-wrap items-end justify-between'>
          <div className='flex gap-2 flex-wrap items-end'>
            <div className='relative'>
              <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Поиск по имени...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='max-w-52 pl-8'
              />
            </div>

            <Select value={clubFilter} onValueChange={setClubFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Клуб' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='all'>Все клубы</SelectItem>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={String(club.id)}>
                      {club.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-52'>
                <SelectValue placeholder='Категория' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Все категории</SelectItem>
                {ageGroups.map(age => (
                  <SelectGroup key={age}>
                    <SelectLabel>{age}</SelectLabel>
                    {categories
                      .filter(c => c.age === age)
                      .map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.weight} кг
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex gap-1 items-center border rounded-md'>
            <Button
              type='button'
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
            >
              <LayoutList className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant={viewMode === 'clubs' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('clubs')}
            >
              <Building2 className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant={viewMode === 'categories' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('categories')}
            >
              <Weight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex gap-2 flex-wrap text-sm'>
          <span className='text-muted-foreground'>Сортировка:</span>
          {(
            [
              { field: 'order', label: 'По умолчанию' },
              { field: 'name', label: 'По имени' },
              { field: 'weight', label: 'По весу' },
              { field: 'club', label: 'По клубу' },
            ] as const
          ).map(({ field, label }) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${sortField === field ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {label}
              {sortField === field && (
                <ArrowUpDown
                  className={`h-3 w-3 ${sortAsc ? '' : 'rotate-180'}`}
                />
              )}
            </button>
          ))}
        </div>

        <div className='border rounded-lg divide-y'>
          {filtered.length === 0 ? (
            <div className='p-6 text-center text-muted-foreground'>
              Бойцы не найдены
            </div>
          ) : viewMode === 'list' ? (
            filtered.map(fighter => (
              <FighterCard
                key={fighter.id}
                fighter={fighter}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : viewMode === 'clubs' ? (
            Object.entries(groupedByClub)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([club, clubFighters]) => (
                <div key={club}>
                  <div className='px-3 py-2 bg-muted/50 font-medium text-sm'>
                    {club} ({clubFighters.length})
                  </div>
                  {clubFighters.map(f => (
                    <FighterCard
                      key={f.id}
                      fighter={f}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ))
          ) : (
            Object.entries(groupedByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([cat, catFighters]) => (
                <div key={cat}>
                  <div className='px-3 py-2 bg-muted/50 font-medium text-sm'>
                    {cat} ({catFighters.length})
                  </div>
                  {catFighters.map(f => (
                    <FighterCard
                      key={f.id}
                      fighter={f}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ))
          )}
        </div>

        <p className='text-sm text-muted-foreground'>
          Всего бойцов: {filtered.length} из {fighters.length}
        </p>
      </div>
    </div>
  );
}
