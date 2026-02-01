import { toast } from 'sonner';
import type { Category, MovieFile, MovieInfo } from '@/models/MovieModel';
import { useMovieProcessorStore } from '@/store/useMovieProcessorStore';
import { useMovieLibraryStore } from '@/store/useMovieLibraryStore';
import { toMovieDetail } from '@/utils/MovieFileHelper';
import { movieDbService } from '@/services/MovieDbService';
import { OmdbApi, omdbApiService } from '@/services/OmdbApiService';
import { utilityApiService } from '@/services/UtilityApiService';
import logger from '@/core/logger';
import { pluralName } from '@/utils/Helper';

export const useMovieProcessor = () => {
  const { movies, loadFiles, inDb, setDetail, setPoster, hasError } =
    useMovieProcessorStore();
  const { setIsProcessing, setIsCompleted } = useMovieProcessorStore();
  const addMovie = useMovieLibraryStore((state) => state.addMovie);

  const processFile = async (
    file: MovieFile,
    categories: Category[],
  ): Promise<void> => {
    const foundTitle = await movieDbService.findMovieDetailByTitle(
      file.title,
      file.year,
    );
    if (foundTitle) {
      setDetail(file, foundTitle);
      const poster = await movieDbService.getPoster(foundTitle.imdbID);
      inDb(file, true);
      if (poster) {
        setPoster(file, poster.blob);
      }
      return;
    }

    const detail = await omdbApiService.getMovieByTitle(file.title, file.year);
    if (detail.Response === OmdbApi.ReservedWords.False) {
      inDb(file, false);
      hasError(file, {
        message: 'Movie detail response is false.',
        detail: detail,
      });
      return;
    }

    const movieDetail = toMovieDetail(detail);
    const foundImdb = await movieDbService.findMovieDetailByImdbID(
      movieDetail.imdbID,
    );
    if (foundImdb && movieDetail.imdbID === foundImdb.imdbID) {
      setDetail(file, foundImdb);
      const poster = await movieDbService.getPoster(foundImdb.imdbID);
      inDb(file, true);
      if (poster) {
        setPoster(file, poster.blob);
      }
      return;
    }

    inDb(file, false);
    setDetail(file, movieDetail);

    let posterBlob: Blob | undefined = undefined;
    if (movieDetail.poster !== OmdbApi.ReservedWords.NotAvailable) {
      posterBlob = await utilityApiService.getPosterImage(movieDetail.poster);
      setPoster(file, posterBlob);
    }

    const movieInfo: MovieInfo = {
      imdbID: movieDetail.imdbID,
      title: movieDetail.title,
      year: movieDetail.year,
      detail: movieDetail,
      poster: posterBlob
        ? {
            url: movieDetail.poster,
            mime: posterBlob.type,
            blob: posterBlob,
          }
        : undefined,
      categories: categories,
    };

    await addMovie(movieInfo);
  };

  const processFiles = async (categories: Category[]) => {
    if (movies.length === 0) {
      const message = 'There is no file available to process.';
      logger.info(message);
      toast(message);
      return;
    }

    setIsProcessing(true);
    setIsCompleted(false);

    logger.info(
      `Started processing ${movies.length} ${pluralName(movies, 'file')}.`,
    );
    setIsProcessing(true);
    const responses = await Promise.allSettled(
      movies.map((m) => processFile(m.file, categories)),
    );

    responses.forEach((r, index) => {
      const movie = movies[index];
      if (!movie) return;

      if (r.status === 'fulfilled') {
        logger.success('File processed', movie.file);
      } else {
        const reason = r.reason as Error | unknown as Error;
        hasError(movie.file, {
          message: reason?.message ?? 'Failed to process file',
        });
        logger.fail('File processed', movie.file);
      }
    });
    setIsProcessing(false);
    setIsCompleted(true);
    toast(
      `The processing of ${movies.length} ${pluralName(movies, 'file has', 'files have')} been done.`,
    );
  };

  return {
    movies,
    loadFiles,
    processFiles,
    removeFile: useMovieProcessorStore((state) => state.remove),
    clear: useMovieProcessorStore((state) => state.reset),
    isProcessing: useMovieProcessorStore((state) => state.isProcessing),
    isCompleted: useMovieProcessorStore((state) => state.isCompleted),
  };
};
