import { useState, useEffect } from 'react';

import { MovieGallery } from '@/components/MovieGallery';
import { MovieSearch } from '@/components/MovieSearch';
import { movieDbService } from '@/services/MovieDbService';
import { type MovieDetail, type MovieUserStatus } from '@/models/MovieModel';
import { type XFile } from '@/components/mine/xfileinput';
import { useMovieFolderLoader } from '@/hooks/useMovieFolderLoader';
import { Toaster, toast } from 'sonner';

import '@/App.css';

function App() {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [userStatuses, setUserStatuses] = useState<
    Record<string, MovieUserStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<XFile[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<XFile[]>([]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [movieDetails, statuses] = await Promise.all([
        movieDbService.allMovies(),
        movieDbService.allUserStatuses(),
      ]);
      setMovies(movieDetails);

      const statusMap: Record<string, MovieUserStatus> = {};
      statuses.forEach((status) => {
        statusMap[status.imdbID] = status;
      });
      setUserStatuses(statusMap);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (imdbID: string) => {
    try {
      await movieDbService.deleteMovie(imdbID);
      // Remove from local state immediately
      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.imdbID !== imdbID),
      );
      toast.success('Movie deleted successfully');
    } catch (err) {
      console.error('Failed to delete movie:', err);
      toast.error('Failed to delete movie');
    }
  };

  const handleToggleFavorite = async (imdbID: string) => {
    const currentStatus = userStatuses[imdbID];
    const newFavoriteStatus = !currentStatus?.isFavorite;

    try {
      await movieDbService.updateUserStatus(imdbID, {
        isFavorite: newFavoriteStatus,
      });
      setUserStatuses((prev) => ({
        ...prev,
        [imdbID]: {
          ...prev[imdbID],
          imdbID,
          isFavorite: newFavoriteStatus,
          isWatched: prev[imdbID]?.isWatched ?? false,
          updatedAt: new Date(),
        },
      }));
      toast.success(
        newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast.error('Failed to update favorite status');
    }
  };

  const handleToggleWatched = async (imdbID: string) => {
    const currentStatus = userStatuses[imdbID];
    const newWatchedStatus = !currentStatus?.isWatched;

    try {
      await movieDbService.updateUserStatus(imdbID, {
        isWatched: newWatchedStatus,
      });
      setUserStatuses((prev) => ({
        ...prev,
        [imdbID]: {
          ...prev[imdbID],
          imdbID,
          isFavorite: prev[imdbID]?.isFavorite ?? false,
          isWatched: newWatchedStatus,
          updatedAt: new Date(),
        },
      }));
      toast.success(
        newWatchedStatus ? 'Marked as watched' : 'Marked as unwatched',
      );
    } catch (err) {
      console.error('Failed to toggle watched status:', err);
      toast.error('Failed to update watched status');
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
      <MovieGallery
        movies={movies}
        userStatuses={userStatuses}
        loading={loading}
        error={error}
        onDelete={handleDeleteMovie}
        onToggleFavorite={handleToggleFavorite}
        onToggleWatched={handleToggleWatched}
      />
      <Toaster />
    </>
  );
}

export default App;
