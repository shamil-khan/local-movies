import { useState, useEffect } from 'react';
import { FolderReader } from '@/components/FolderReader';
import { MovieGallery } from '@/components/MovieGallery';
import { MovieSearch } from '@/components/MovieSearch';
import { movieDbService } from '@/services/MovieDbService';
import { type MovieDetail } from '@/models/MovieModel';
import { XFileInput, type XFile } from '@/components/mine/xfileinput';
import { useMovieFolderLoader } from '@/hooks/useMovieFolderLoader';
import { Button } from '@/components/ui/button';

import '@/App.css';

function App() {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<XFile[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<XFile[]>([]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const movieDetails = await movieDbService.allMovies();
      setMovies(movieDetails);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const { loading: folderLoading, error: folderError } = useMovieFolderLoader(
    loadedFiles,
    loadMovies,
  );

  useEffect(() => {
    loadMovies();
  }, []);

  return (
    <>
      <div className='flex items-center justify-center p-6 gap-4'>
        <XFileInput folder={true} onUpload={setSelectedFiles} text='Movies' />
        <Button
          onClick={() => setLoadedFiles(selectedFiles)}
          disabled={selectedFiles.length === 0 || folderLoading}>
          Load
        </Button>
        {folderLoading && <p>Loading folder...</p>}
        {folderError && <p>Error: {folderError}</p>}
      </div>
      <div className='flex items-center justify-center p-6'>
        <MovieSearch onMovieAdded={loadMovies} />
      </div>
      <MovieGallery movies={movies} loading={loading} error={error} />
    </>
  );
}

export default App;
