import { useMemo } from 'react';
import { type MovieFilterCriteria } from '@/models/MovieModel';
import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';

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

  const availableYears = useMemo(() => {
    const spans = Array.from(
      new Set(movieDetails.map((m) => m.year).filter(Boolean)),
    )
      .sort((a, b) => b.localeCompare(a))
      .map((y) => {
        const year = parseInt(y, 10);
        if (Number.isNaN(year)) {
          return 'N/A';
        }
        const yStart = Math.floor(year / 5) * 5;
        const yEnd = yStart + 4;
        return `${yStart} - ${yEnd}`;
      });
    return Array.from(new Set(spans));
  }, [movieDetails]);
  const availableRated = useMemo(
    () =>
      Array.from(
        new Set(movieDetails.map((m) => m.rated).filter(Boolean)),
      ).sort(),
    [movieDetails],
  );

  const availableRatings = useMemo(() => {
    const ratings = Array.from(
      new Set(movieDetails.map((m) => m.imdbRating).filter(Boolean)),
    )
      .sort((a, b) => parseFloat(b) - parseFloat(a))
      .map((r) => {
        const rating = parseFloat(r);
        if (Number.isNaN(rating)) return 'N/A';
        const start = Math.floor(rating * 2) / 2;
        const end = start + 0.4;
        return `${start.toFixed(1)} - ${end.toFixed(1)}`;
      });

    return Array.from(new Set(ratings));
  }, [movieDetails]);

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
      categories
        .map((c) => ({
          label: c.name,
          value: c.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [categories],
  );

  const filteredMovies = useMemo(() => {
    const isYearInGroups = (value: string): boolean => {
      const year = parseInt(value);
      if (Number.isNaN(year)) {
        return filters.year.includes('N/A');
      }

      const spanStart = Math.floor(year / 5) * 5;
      const targetSpan = `${spanStart} - ${spanStart + 4}`;

      return filters.year.includes(targetSpan);
    };

    const isRatingInGroups = (value: string): boolean => {
      const rating = parseFloat(value);
      if (Number.isNaN(rating)) {
        return filters.rating.includes('N/A');
      }
      const spanStart = Math.floor(rating * 2) / 2;
      const spanEnd = spanStart + 0.4;
      const targetSpan = `${spanStart.toFixed(1)} - ${spanEnd.toFixed(1)}`;

      return filters.rating.includes(targetSpan);
    };
    return movies.filter((movie) => {
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
        filters.year.length === 0 ? true : isYearInGroups(movie.detail.year);

      const matchesRated =
        filters.rated.length === 0
          ? true
          : filters.rated.includes(movie.detail.rated);

      const matchesRating =
        filters.rating.length === 0
          ? true
          : isRatingInGroups(movie.detail.imdbRating);

      const movieLanguages = movie.detail.language
        .split(',')
        .map((l) => l.trim().toLowerCase());
      const matchesLanguage =
        filters.language.length === 0
          ? true
          : filters.language.some((v) =>
              movieLanguages.includes(v.toLowerCase()),
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
  }, [filters, movies]);

  const onFiltersUpdated = (filters: MovieFilterCriteria) => {
    updatedFilters(filters);
  };

  const hasActiveFilters = useMemo(
    () =>
      (filters.genre && filters.genre.length > 0) ||
      (filters.year && filters.year.length > 0) ||
      (filters.rating && filters.rating.length > 0) ||
      (filters.rated && filters.rated.length > 0) ||
      (filters.language && filters.language.length > 0) ||
      (filters.country && filters.country.length > 0) ||
      (filters.category && filters.category.length > 0) ||
      filters.isFavorite ||
      filters.isWatched ||
      (filters.query && filters.query.trim().length > 0),
    [filters],
  );

  return {
    filteredMovies: filteredMovies.sort((a, b) =>
      a.title.localeCompare(b.title),
    ),
    filters: filters,
    hasActiveFilters,
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
