import { useState, useEffect, useMemo, useRef } from 'react';

import { MovieGallery } from '@/components/MovieGallery';
import { MovieSearch } from '@/components/MovieSearch';
import { movieDbService } from '@/services/MovieDbService';
import { type MovieDetail, type MovieUserStatus } from '@/models/MovieModel';
import { type XFile } from '@/components/mine/xfileinput';
import { useMovieFolderLoader } from '@/hooks/useMovieFolderLoader';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { Toaster, toast } from 'sonner';

import '@/App.css';

export interface ExtractedTitle {
  title: string;
  filename: string;
  originalFile: XFile;
  inDb: boolean;
}

function App() {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [userStatuses, setUserStatuses] = useState<
    Record<string, MovieUserStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<XFile[]>([]);
  const [extractedTitles, setExtractedTitles] = useState<ExtractedTitle[]>([]);
  const [successTitles, setSuccessTitles] = useState<ExtractedTitle[]>([]);
  const [failedTitles, setFailedTitles] = useState<ExtractedTitle[]>([]);
  const [filesToProcess, setFilesToProcess] = useState<XFile[]>([]);
  const [
    selectedCategoryIdsForProcessing,
    setSelectedCategoryIdsForProcessing,
  ] = useState<number[]>([]);

  const [filterCriteria, setFilterCriteria] = useState<{
    query: string;
    genre: string[];
    year: string[];
    rating: string[];
    rated: string[];
    language: string[];
    country: string[];
    category: string[];
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
    category: [],
    isFavorite: false,
    isWatched: false,
  });

  const [categories, setCategories] = useState<
    import('@/models/MovieModel').Category[]
  >([]);
  const [movieCategoryMap, setMovieCategoryMap] = useState<
    Record<string, number[]>
  >({});

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

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
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

      // Category: Match if movie has ANY of the selected categories
      const movieCategoryIds = movieCategoryMap[movie.imdbID] || [];
      const selectedCategoryIds = filterCriteria.category.map((c) =>
        parseInt(c, 10),
      );
      const matchesCategory =
        filterCriteria.category.length === 0
          ? true
          : selectedCategoryIds.some((catId) =>
              movieCategoryIds.includes(catId),
            );

      return (
        matchesQuery &&
        matchesGenre &&
        matchesYear &&
        matchesRated &&
        matchesRating &&
        matchesLanguage &&
        matchesCountry &&
        matchesCategory &&
        matchesFavorite &&
        matchesWatched
      );
    });
  }, [movies, userStatuses, filterCriteria, movieCategoryMap]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [movieDetails, statuses, allCategories] = await Promise.all([
        movieDbService.allMovies(),
        movieDbService.allUserStatuses(),
        movieDbService.allCategories(),
      ]);
      setMovies(movieDetails);
      setCategories(allCategories);

      const statusMap: Record<string, MovieUserStatus> = {};
      statuses.forEach((status) => {
        statusMap[status.imdbID] = status;
      });
      setUserStatuses(statusMap);

      // Load category mappings for all movies
      const categoryMap: Record<string, number[]> = {};
      for (const movie of movieDetails) {
        const movieCategories = await movieDbService.getMovieCategories(
          movie.imdbID,
        );
        categoryMap[movie.imdbID] = movieCategories.map((c) => c.id!);
      }
      setMovieCategoryMap(categoryMap);
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

  const handleClearLibrary = async () => {
    try {
      await movieDbService.clearDatabase();
      setMovies([]);
      setUserStatuses({});
      setSuccessTitles([]);
      setFailedTitles([]);
      setExtractedTitles([]);
      setSelectedFiles([]);
      setFilesToProcess([]);
      toast.success('Library deleted successfully');
    } catch (err) {
      console.error('Failed to clear library:', err);
      toast.error('Failed to clear library');
    }
  };

  // Use ref to access latest extractedTitles in callback
  const extractedTitlesRef = useRef<ExtractedTitle[]>([]);
  useEffect(() => {
    extractedTitlesRef.current = extractedTitles;
  }, [extractedTitles]);

  const { loading: folderLoading, error: folderError } = useMovieFolderLoader(
    filesToProcess,
    (details, processedFiles) => {
      // Robust Logic: use processedFiles passed from the loader
      const successes: ExtractedTitle[] = [];
      const failures: ExtractedTitle[] = [];

      // We need to map back to ExtractedTitle objects.
      // We can use 'extractedTitles' state, but to be 100% safe against stale closures (though we use ref now),
      // we can try to find the original file in 'selectedFiles'.
      // However, 'selectedFiles' might also be stale if not careful?
      // Actually, 'extractedTitles' is state, so we have it in closure (or ref).
      // But we are in a callback.

      // Use the original extractedTitles from ref to preserve file information
      const originalTitles = extractedTitlesRef.current;

      // Match processed files with original extracted titles and API results
      processedFiles.forEach((pf) => {
        // Find the original ExtractedTitle by filename
        const originalTitle = originalTitles.find(
          (et: ExtractedTitle) => et.filename === pf.filename,
        );

        // Find matching movie detail from API
        const matchDetail = details.find(
          (d) =>
            d.Response === 'True' &&
            (d.Title.toLowerCase() === pf.title.toLowerCase() ||
              (originalTitle &&
                d.Title.toLowerCase() === originalTitle.title.toLowerCase())),
        );

        // Use original title if available, otherwise create from processed file
        const statusItem: ExtractedTitle = originalTitle
          ? { ...originalTitle, inDb: !!matchDetail }
          : {
              title: pf.title,
              filename: pf.filename,
              originalFile: { name: pf.filename, path: '', size: 0 },
              inDb: !!matchDetail,
            };

        if (matchDetail) {
          successes.push({ ...statusItem, inDb: true });
        } else {
          failures.push(statusItem);
        }
      });

      setSuccessTitles((prev) => [...prev, ...successes]);
      setFailedTitles((prev) => [...prev, ...failures]);

      // Reset upload and extracted panels
      setSelectedFiles([]);
      setExtractedTitles([]);

      // Reset processing queue
      setFilesToProcess([]);

      // Refresh movies
      loadMovies();

      console.log('Processed Robust:', {
        processedFilesLength: processedFiles.length,
        successes: successes.length,
        failures: failures.length,
      });
    },
    selectedCategoryIdsForProcessing,
  );

  // Effect to extract titles when selectedFiles changes
  useEffect(() => {
    const extractTitles = async () => {
      if (selectedFiles.length === 0) {
        setExtractedTitles([]);
        return;
      }

      const movieFiles = toMovieFiles(selectedFiles.map((f) => f.name));
      const newExtractedTitles: ExtractedTitle[] = [];
      const seenTitles = new Set<string>();

      for (const mf of movieFiles) {
        // Deduplication: Skip if title already seen in this batch
        if (seenTitles.has(mf.title.toLowerCase())) {
          continue;
        }
        seenTitles.add(mf.title.toLowerCase());

        const originalFile = selectedFiles.find((f) => f.name === mf.filename);
        if (!originalFile) continue;

        // Check if exists in DB (simplified check, ideal would be batch check)
        // We can use the existing movie list to check if title exists roughly,
        // but movieDbService.fileExists checks strictly by filename usually.
        // Let's check if we have a movie with this title in 'movies' state?
        // Or better, use movieDbService.findByTitle if we want to be accurate to DB.
        // However, 'movies' state has all movies loaded.

        const existingMovie = movies.find(
          (m) => m.Title.toLowerCase() === mf.title.toLowerCase(),
        );

        newExtractedTitles.push({
          title: mf.title,
          filename: mf.filename,
          originalFile: originalFile,
          inDb: !!existingMovie,
        });
      }
      setExtractedTitles(newExtractedTitles);
    };

    extractTitles();
  }, [selectedFiles, movies]);

  const handleProcessTitles = (categoryIds?: number[]) => {
    const files = extractedTitles.map((t) => t.originalFile);
    setSelectedCategoryIdsForProcessing(categoryIds || []);
    setFilesToProcess(files);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  return (
    <>
      <div className='p-6 w-full'>
        <MovieSearch
          onMovieAdded={loadMovies}
          onFolderUpload={setSelectedFiles}
          onRemoveFile={(file) => {
            const newFiles = selectedFiles.filter((f) => f !== file);
            setSelectedFiles(newFiles);
          }}
          selectedFiles={selectedFiles}
          extractedTitles={extractedTitles}
          onRemoveTitle={(titleItem) => {
            setExtractedTitles((prev) => prev.filter((t) => t !== titleItem));
            // Optionally remove from selectedFiles too?
            // The user request says "user can remove title from the panel".
            // Removing title effectively ignores that file for processing.
            // We should probably keep selectedFiles in sync or just ignore it in process.
            // Let's just remove from extractedTitles so it won't be processed.
          }}
          onProcessTitles={handleProcessTitles}
          successTitles={successTitles}
          failedTitles={failedTitles}
          onRemoveSuccessTitle={(t) =>
            setSuccessTitles((prev) => prev.filter((x) => x !== t))
          }
          onRemoveFailedTitle={(t) =>
            setFailedTitles((prev) => prev.filter((x) => x !== t))
          }
          folderLoading={folderLoading}
          folderError={folderError}
          onClearLibrary={handleClearLibrary}
          onFilterChange={setFilterCriteria}
          filters={filterCriteria}
          availableGenres={availableGenres}
          availableYears={availableYears}
          availableRated={availableRated}
          availableRatings={availableRatings}
          availableLanguages={availableLanguages}
          availableCountries={availableCountries}
          availableCategories={categories.map((c) => ({
            label: c.name,
            value: c.id!.toString(),
          }))}
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
