import { useState, useMemo } from 'react';
import { type MovieFilterCriteria } from '@/models/MovieModel';
import { useMovieLibrary } from '@/hooks/library/useMovieLibrary';
import logger from '@/core/logger';

export const useMovieFilters = () => {
  const [filterCriteria, setFilterCriteria] = useState<MovieFilterCriteria>({
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

  const { movies } = useMovieLibrary();
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

  const availableRatings = useMemo(
    () =>
      Array.from(
        new Set(movieDetails.map((m) => m.imdbRating).filter(Boolean)),
      ).sort((a, b) => parseFloat(b) - parseFloat(a)),
    [movieDetails],
  );

  const filteredMovies = useMemo(() => {
    logger.info('Filtering movies with criteria:', filterCriteria);
    const result = movies.filter((movie) => {
      const matchesQuery = filterCriteria.query
        ? movie.title.toLowerCase().includes(filterCriteria.query.toLowerCase())
        : true;

      const movieGenres = movie.detail.genre
        .split(',')
        .map((g) => g.trim().toLowerCase());
      const matchesGenre =
        filterCriteria.genre.length === 0
          ? true
          : filterCriteria.genre.some((g) =>
            movieGenres.includes(g.toLowerCase()),
          );

      const matchesYear =
        filterCriteria.year.length === 0
          ? true
          : filterCriteria.year.includes(movie.detail.year);

      const matchesRated =
        filterCriteria.rated.length === 0
          ? true
          : filterCriteria.rated.includes(movie.detail.rated);

      const matchesRating =
        filterCriteria.rating.length === 0
          ? true
          : filterCriteria.rating.includes(movie.detail.imdbRating);

      const movieLanguages = movie.detail.language
        .split(',')
        .map((l) => l.trim().toLowerCase());
      const matchesLanguage =
        filterCriteria.language.length === 0
          ? true
          : filterCriteria.language.some((l) =>
            movieLanguages.includes(l.toLowerCase()),
          );

      const movieCountries = movie.detail.country
        .split(',')
        .map((c) => c.trim().toLowerCase());
      const matchesCountry =
        filterCriteria.country.length === 0
          ? true
          : filterCriteria.country.some((c) =>
            movieCountries.includes(c.toLowerCase()),
          );

      const matchesFavorite = filterCriteria.isFavorite
        ? movie.status?.isFavorite
        : true;

      const matchesWatched = filterCriteria.isWatched
        ? movie.status?.isWatched
        : true;

      const selectedCategoryIds = filterCriteria.category.map((c) =>
        parseInt(c, 10),
      );
      const matchesCategory =
        filterCriteria.category.length === 0
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
  }, [filterCriteria, movies]);

  const clearFilters = () => {
    setFilterCriteria({
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
  };

  const onFiltersUpdated = (filters: MovieFilterCriteria) => {
    logger.info('Filters updated', filters);
    setFilterCriteria(filters);
  };

  return {
    filteredMovies,
    filters: filterCriteria,
    onFiltersUpdated,
    onRemoveFilters: clearFilters,
    availableGenres,
    availableYears,
    availableRated,
    availableRatings,
    availableLanguages,
    availableCountries,
  };
};
