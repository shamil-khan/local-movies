import { useState, useEffect } from 'react';

import { MovieGallery } from '@/components/MovieGallery';
import { MovieSearch } from '@/components/MovieSearch';
import { movieDbService } from '@/services/MovieDbService';
import { type MovieDetail } from '@/models/MovieModel';
import { type XFile } from '@/components/mine/xfileinput';
import { useMovieFolderLoader } from '@/hooks/useMovieFolderLoader';
import { Toaster } from '@/components/ui/sonner';

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
      <div className='p-6 w-full'>
        <MovieSearch
          onMovieAdded={loadMovies}
          onFolderUpload={setSelectedFiles}
          onLoad={() => setLoadedFiles(selectedFiles)}
          selectedFiles={selectedFiles}
          folderLoading={folderLoading}
          folderError={folderError}
        />
      </div>
      <MovieGallery movies={movies} loading={loading} error={error} />
      <Toaster />
    </>
  );
}

export default App;
