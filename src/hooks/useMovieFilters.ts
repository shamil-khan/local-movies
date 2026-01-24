import { useMemo } from 'react';
import { type MovieFilterCriteria } from '@/models/MovieModel';
import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';
import logger from '@/core/logger';

export const useMovieFilters = () => {
  const { movies, categories, filters, updatedFilters, clearFilters } =
    useMovieLibraryStore();

  const movieDetails = useMemo(() => movies.map((m) => m.detail), [movies]);

  const availableGenres = useMemo(
    () =>
      Array.from(
        new Set(
          movieDetails
            .flatMap((m) => m.genre.split(',').map((g) => g.trim()))
            .filter(Boolean),
        ),
      ).sort(),
    [movieDetails],
  );

  const availableYears = useMemo(
    () =>
      Array.from(new Set(movieDetails.map((m) => m.year).filter(Boolean))).sort(
        (a, b) => b.localeCompare(a),
      ),
    [movieDetails],
  );

  const availableRated = useMemo(
    () =>
      Array.from(
        new Set(movieDetails.map((m) => m.rated).filter(Boolean)),
      ).sort(),
    [movieDetails],
  );

  const availableLanguages = useMemo(
    () =>
      Array.from(
        new Set(
          movieDetails
            .flatMap((m) => m.language.split(',').map((l) => l.trim()))
            .filter(Boolean),
        ),
      ).sort(),
    [movieDetails],
  );

  const availableCountries = useMemo(
    () =>
      Array.from(
        new Set(
          movieDetails
            .flatMap((m) => m.country.split(',').map((c) => c.trim()))
            .filter(Boolean),
        ),
      ).sort(),
    [movieDetails],
  );

  const availableCategories = useMemo(
    () =>
      categories.map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [categories],
  );

  const availableRatings = useMemo(
    () =>
      Array.from(
        new Set(movieDetails.map((m) => m.imdbRating).filter(Boolean)),
      ).sort((a, b) => parseFloat(b) - parseFloat(a)),
    [movieDetails],
  );

  const filteredMovies = useMemo(() => {
    logger.info('Filtering movies with criteria:', filters);
    const result = movies.filter((movie) => {
      const matchesQuery = filters.query
        ? movie.title.toLowerCase().includes(filters.query.toLowerCase())
        : true;

      const movieGenres = movie.detail.genre
        .split(',')
        .map((g) => g.trim().toLowerCase());
      const matchesGenre =
        filters.genre.length === 0
          ? true
          : filters.genre.some((g) => movieGenres.includes(g.toLowerCase()));

      const matchesYear =
        filters.year.length === 0
          ? true
          : filters.year.includes(movie.detail.year);

      const matchesRated =
        filters.rated.length === 0
          ? true
          : filters.rated.includes(movie.detail.rated);

      const matchesRating =
        filters.rating.length === 0
          ? true
          : filters.rating.includes(movie.detail.imdbRating);

      const movieLanguages = movie.detail.language
        .split(',')
        .map((l) => l.trim().toLowerCase());
      const matchesLanguage =
        filters.language.length === 0
          ? true
          : filters.language.some((l) =>
              movieLanguages.includes(l.toLowerCase()),
            );

      const movieCountries = movie.detail.country
        .split(',')
        .map((c) => c.trim().toLowerCase());
      const matchesCountry =
        filters.country.length === 0
          ? true
          : filters.country.some((c) =>
              movieCountries.includes(c.toLowerCase()),
            );

      const matchesFavorite = filters.isFavorite
        ? movie.status?.isFavorite
        : true;

      const matchesWatched = filters.isWatched ? movie.status?.isWatched : true;

      const selectedCategoryIds = filters.category.map((c) => parseInt(c, 10));
      const matchesCategory =
        filters.category.length === 0
          ? true
          : selectedCategoryIds.some((catId) =>
              movie.categories?.map((c) => c.id).includes(catId),
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
    logger.info(`Filtered movies count: ${result.length}`);
    return result;
  }, [filters, movies]);

  const onFiltersUpdated = (filters: MovieFilterCriteria) => {
    logger.info('Filters updated', filters);
    updatedFilters(filters);
  };

  return {
    filteredMovies,
    filters: filters,
    onFiltersUpdated,
    onRemoveFilters: clearFilters,
    availableGenres,
    availableYears,
    availableRated,
    availableRatings,
    availableLanguages,
    availableCountries,
    availableCategories,
  };
};
