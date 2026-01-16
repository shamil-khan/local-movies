import { useState, useMemo } from 'react';
import { type MovieDetail, type MovieUserStatus } from '@/models/MovieModel';
import { type MovieFilterCriteria } from '@/models/MovieModel';

interface UseMovieFiltersProps {
  movies: MovieDetail[];
  userStatuses: Record<string, MovieUserStatus>;
  movieCategoryMap: Record<string, number[]>;
}

export const useMovieFilters = ({
  movies,
  userStatuses,
  movieCategoryMap,
}: UseMovieFiltersProps) => {
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

  const availableGenres = useMemo(
    () =>
      Array.from(
        new Set(
          movies
            .flatMap((m) => m.Genre.split(',').map((g) => g.trim()))
            .filter(Boolean),
        ),
      ).sort(),
    [movies],
  );

  const availableYears = useMemo(
    () =>
      Array.from(new Set(movies.map((m) => m.Year).filter(Boolean))).sort(
        (a, b) => b.localeCompare(a),
      ),
    [movies],
  );

  const availableRated = useMemo(
    () =>
      Array.from(new Set(movies.map((m) => m.Rated).filter(Boolean))).sort(),
    [movies],
  );

  const availableLanguages = useMemo(
    () =>
      Array.from(
        new Set(
          movies
            .flatMap((m) => m.Language.split(',').map((l) => l.trim()))
            .filter(Boolean),
        ),
      ).sort(),
    [movies],
  );

  const availableCountries = useMemo(
    () =>
      Array.from(
        new Set(
          movies
            .flatMap((m) => m.Country.split(',').map((c) => c.trim()))
            .filter(Boolean),
        ),
      ).sort(),
    [movies],
  );

  const availableRatings = useMemo(
    () =>
      Array.from(new Set(movies.map((m) => m.imdbRating).filter(Boolean))).sort(
        (a, b) => parseFloat(b) - parseFloat(a),
      ),
    [movies],
  );

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const movieStatus = userStatuses[movie.imdbID];

      const matchesQuery = filterCriteria.query
        ? movie.Title.toLowerCase().includes(filterCriteria.query.toLowerCase())
        : true;

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

  return {
    filterCriteria,
    setFilterCriteria,
    filteredMovies,
    availableGenres,
    availableYears,
    availableRated,
    availableRatings,
    availableLanguages,
    availableCountries,
    clearFilters,
  };
};
