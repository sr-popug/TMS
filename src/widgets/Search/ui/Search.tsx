import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group';
import { SearchIcon } from 'lucide-react';
import SearchResults from './SearchResults';

export default function Search() {
  return (
    <div>
      <InputGroup>
        <InputGroupInput
          id='inline-start-input'
          placeholder='Искать турнир...'
        />
        <InputGroupAddon align='inline-start'>
          <SearchIcon className='text-muted-foreground' />
        </InputGroupAddon>
      </InputGroup>

      <SearchResults />
    </div>
  );
}
