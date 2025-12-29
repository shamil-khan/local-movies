import { FolderReader } from '@/components/FolderReader';
import { MovieSearch } from '@/components/OmdbMovie';
import '@/App.css';

function App() {
  return (
    <>
      <h1 className='text-3xl font-extrabold tracking-tight lg:text-4xl m-4'>
        Local Movies
      </h1>
      <div className='flex items-center justify-center p-6'>
        <MovieSearch />
      </div>
      <div className='flex items-center justify-center p-6'>
        <FolderReader />
      </div>
    </>
  );
}

export default App;
