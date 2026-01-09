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

  const [filterCriteria, setFilterCriteria] = useState<{
    query: string;
    genre: string[];
    year: string[];
    rating: string[];
    rated: string[];
    language: string[];
    country: string[];
    isFavorite: boolean;
    isWatched: boolean;
  }>({
    query: '',
    genre: [],
    year: [],
    rating: [],
    rated: [],
    language: [],
    country: [],
    isFavorite: false,
    isWatched: false,
  });

  // Extract available options from movies
  const availableGenres = Array.from(
    new Set(
      movies
        .flatMap((m) => m.Genre.split(',').map((g) => g.trim()))
        .filter(Boolean),
    ),
  ).sort();

  const availableYears = Array.from(
    new Set(movies.map((m) => m.Year).filter(Boolean)),
  ).sort((a, b) => b.localeCompare(a)); // Descending

  const availableRated = Array.from(
    new Set(movies.map((m) => m.Rated).filter(Boolean)),
  ).sort();

  const availableLanguages = Array.from(
    new Set(
      movies
        .flatMap((m) => m.Language.split(',').map((l) => l.trim()))
        .filter(Boolean),
    ),
  ).sort();

  const availableCountries = Array.from(
    new Set(
      movies
        .flatMap((m) => m.Country.split(',').map((c) => c.trim()))
        .filter(Boolean),
    ),
  ).sort();

  const availableRatings = Array.from(
    new Set(movies.map((m) => m.imdbRating).filter(Boolean)),
  ).sort((a, b) => parseFloat(b) - parseFloat(a)); // Descending numerics

  const filteredMovies = movies.filter((movie) => {
    const movieStatus = userStatuses[movie.imdbID];

    const matchesQuery = filterCriteria.query
      ? movie.Title.toLowerCase().includes(filterCriteria.query.toLowerCase())
      : true;

    // Genre: Match if movie has ANY of the selected genres
    const movieGenres = movie.Genre.split(',').map((g) =>
      g.trim().toLowerCase(),
    );
    const matchesGenre =
      filterCriteria.genre.length === 0
        ? true
        : filterCriteria.genre.some((g) =>
          movieGenres.includes(g.toLowerCase()),
        );

    const matchesYear =
      filterCriteria.year.length === 0
        ? true
        : filterCriteria.year.includes(movie.Year);

    const matchesRated =
      filterCriteria.rated.length === 0
        ? true
        : filterCriteria.rated.includes(movie.Rated);

    const matchesRating =
      filterCriteria.rating.length === 0
        ? true
        : filterCriteria.rating.includes(movie.imdbRating);

    const movieLanguages = movie.Language.split(',').map((l) =>
      l.trim().toLowerCase(),
    );
    const matchesLanguage =
      filterCriteria.language.length === 0
        ? true
        : filterCriteria.language.some((l) =>
          movieLanguages.includes(l.toLowerCase()),
        );

    const movieCountries = movie.Country.split(',').map((c) =>
      c.trim().toLowerCase(),
    );
    const matchesCountry =
      filterCriteria.country.length === 0
        ? true
        : filterCriteria.country.some((c) =>
          movieCountries.includes(c.toLowerCase()),
        );

    const matchesFavorite = filterCriteria.isFavorite
      ? movieStatus?.isFavorite
      : true;

    const matchesWatched = filterCriteria.isWatched
      ? movieStatus?.isWatched
      : true;

    return (
      matchesQuery &&
      matchesGenre &&
      matchesYear &&
      matchesRated &&
      matchesRating &&
      matchesLanguage &&
      matchesCountry &&
      matchesFavorite &&
      matchesWatched
    );
  });

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
          onRemoveFile={(file) => {
            const newFiles = selectedFiles.filter((f) => f !== file);
            setSelectedFiles(newFiles);
          }}
          selectedFiles={selectedFiles}
          folderLoading={folderLoading}
          folderError={folderError}
          onFilterChange={setFilterCriteria}
          filters={filterCriteria}
          availableGenres={availableGenres}
          availableYears={availableYears}
          availableRated={availableRated}
          availableRatings={availableRatings}
          availableLanguages={availableLanguages}
          availableCountries={availableCountries}
        />
      </div>
      <MovieGallery
        movies={filteredMovies}
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
