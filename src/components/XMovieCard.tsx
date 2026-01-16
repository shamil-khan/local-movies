import { type MovieDetail, type MovieUserStatus } from '@/models/MovieModel';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, parse } from 'numerable';
import { en } from 'numerable/locale';
import {
  Star,
  Award,
  Play,
  Loader2,
  AlertCircle,
  Trash2,
  Heart,
  Eye,
  Tags,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { movieDbService } from '@/services/MovieDbService';
import { tmdbApiService, type MovieTrailer } from '@/services/TmdbApiService';
import logger from '@/core/logger';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CategorySelector } from '@/components/CategorySelector';

const toCompact = (value: string) =>
  format(parse(value), '0.00 a', { locale: en }).replace(/\.00$/, '');

const formatRuntime = (runtime: string) => {
  const match = runtime.match(/(\d+) min/);
  if (match) {
    const min = parseInt(match[1]);
    const hours = Math.floor(min / 60);
    const mins = min % 60;
    return `${hours}h ${mins}m`;
  }
  return runtime;
};

interface XMovieCardProps {
  movieDetail: MovieDetail;
  userStatus?: MovieUserStatus;
  onDelete?: (imdbID: string) => void;
  onToggleFavorite?: (imdbID: string) => void;
  onToggleWatched?: (imdbID: string) => void;
  movieCategoryIds?: number[];
  onUpdateCategories?: (imdbID: string, categoryIds: number[]) => void;
}

export const XMovieCard = ({
  movieDetail,
  userStatus,
  onDelete,
  onToggleFavorite,
  onToggleWatched,
  movieCategoryIds,
  onUpdateCategories,
}: XMovieCardProps) => {
  const [open, setOpen] = useState(false);
  const [trailer, setTrailer] = useState<MovieTrailer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterSrc, setPosterSrc] = useState<string>(
    movieDetail.poster && movieDetail.poster !== 'N/A'
      ? movieDetail.poster
      : '/generic-movie-poster.svg',
  );

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    movieCategoryIds ?? [],
  );

  useEffect(() => {
    setSelectedCategoryIds(movieCategoryIds ?? []);
  }, [movieCategoryIds]);

  // Load poster from DB
  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPoster = async () => {
      logger.info(`Loading poster for ${movieDetail.title} from DB`);
      try {
        const poster = await movieDbService.getPoster(movieDetail.imdbID);
        if (poster && poster.blob) {
          objectUrl = URL.createObjectURL(poster.blob);
          setPosterSrc(objectUrl);
          logger.success(`Loaded poster for ${movieDetail.title} from DB`);
        } else {
          // If not in DB, use a generic movie poster image
          logger.warn(`Failed to load poster for ${movieDetail.title} from DB`);
          setPosterSrc('/generic-movie-poster.svg');
        }
      } catch (e) {
        logger.error(`Failed to load poster for ${movieDetail.title}`, e);
        setPosterSrc('/generic-movie-poster.svg');
      }
    };

    loadPoster();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [movieDetail.imdbID, movieDetail.poster, movieDetail.title]);

  // Fetch trailer when dialog opens
  useEffect(() => {
    if (!open || trailer || loading) {
      return;
    }

    const loadTrailer = async () => {
      setLoading(true);
      setError(null);

      try {
        logger.info(`Fetching trailer for IMDb ID: ${movieDetail.imdbID}`);
        const trailerData = await tmdbApiService.getTrailerByImdbId(
          movieDetail.imdbID,
        );

        if (trailerData) {
          setTrailer(trailerData);
          logger.success(`Trailer found: ${trailerData.name}`);
        } else {
          setError('No trailer available for this movie');
          logger.warn(`No trailer found for: ${movieDetail.title}`);
        }
      } catch (err) {
        setError('Failed to load trailer');
        logger.error('Error fetching trailer:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadTrailer();
  }, [open, trailer, loading, movieDetail.imdbID, movieDetail.title]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset state when dialog closes
    if (!newOpen) {
      setTrailer(null);
      setError(null);
    }
  };

  const handleSaveCategories = () => {
    if (onUpdateCategories) {
      onUpdateCategories(movieDetail.imdbID, selectedCategoryIds);
    }
    setCategoryDialogOpen(false);
  };

  return (
    <Card className='w-full overflow-visible group'>
      <CardContent className='py-0 px-2 h-full'>
        <div className='text-center relative h-full flex flex-col'>
          <h3 className='text-sm font-bold mb-1'>{movieDetail.title}</h3>
          <p className='text-xs font-semibold mb-1'>{movieDetail.year}</p>
          <div className='text-center mb-1'>
            <div className='flex items-center justify-center mb-1'>
              <span className='text-xs font-bold italic'>
                {movieDetail.rated}
              </span>
              <div className='flex items-center justify-center space-x-2 ml-4'>
                <span className='flex items-center'>
                  <Star className='w-3 h-3 fill-current' />
                  <span className='text-xs font-semibold ml-0'>
                    {movieDetail.imdbRating}
                  </span>
                </span>
                <span className='flex items-center'>
                  <Award className='w-3 h-3' />
                  <span className='text-xs font-semibold ml-0'>
                    {movieDetail.metascore}
                  </span>
                </span>
              </div>
            </div>
            <p className='text-[0.6rem] font-medium'>
              {toCompact(movieDetail.imdbVotes)}
            </p>
          </div>
          <p className='text-xs font-medium mb-1'>{movieDetail.genre}</p>
          <p className='text-xs font-normal mb-1'>
            {movieDetail.language}{' '}
            <span className='font-bold ml-1'>
              {formatRuntime(movieDetail.runtime)}
            </span>
          </p>
          <p className='text-xs font-light mb-1'>{movieDetail.country}</p>
          <p className='text-xs font-bold mb-1'>{movieDetail.awards}</p>

          <div
            className='relative mx-auto w-32 h-48 mb-1 cursor-pointer group/image'
            onClick={() => setOpen(true)}>
            <img
              src={posterSrc}
              alt={movieDetail.title}
              className='w-full h-full object-cover rounded-md transition-opacity group-hover/image:opacity-75'
            />
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity'>
              <div className='bg-black/60 rounded-full p-3'>
                <Play className='w-8 h-8 text-white fill-white' />
              </div>
            </div>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            {/* No Trigger - Controlled by state */}
            <DialogContent className='sm:max-w-[700px]'>
              <DialogHeader>
                <DialogTitle>
                  {movieDetail.title} ({movieDetail.year})
                </DialogTitle>
                <DialogDescription>
                  {trailer
                    ? trailer.name
                    : 'Loading official trailer from YouTube...'}
                </DialogDescription>
              </DialogHeader>

              <div className='flex flex-col gap-4'>
                {loading && (
                  <div className='flex items-center justify-center py-12'>
                    <Loader2 className='w-8 h-8 animate-spin text-primary' />
                    <span className='ml-3 text-sm text-muted-foreground'>
                      Fetching trailer...
                    </span>
                  </div>
                )}

                {error && !loading && (
                  <div className='flex flex-col items-center justify-center py-12 gap-4'>
                    <AlertCircle className='w-12 h-12 text-destructive' />
                    <p className='text-sm text-muted-foreground'>{error}</p>
                    <p className='text-xs text-muted-foreground'>
                      IMDb ID: {movieDetail.imdbID}
                    </p>
                  </div>
                )}

                {trailer && !loading && (
                  <div className='flex flex-col gap-4'>
                    <div
                      className='relative w-full'
                      style={{ paddingTop: '56.25%' }}>
                      <iframe
                        className='absolute top-0 left-0 w-full h-full rounded-lg'
                        src={`https://www.youtube.com/embed/${trailer.youtubeKey}`}
                        title={trailer.name}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      />
                    </div>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>IMDb ID: {movieDetail.imdbID}</span>
                      {trailer.official && (
                        <span className='text-green-600 font-semibold'>
                          Official Trailer
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={categoryDialogOpen}
            onOpenChange={setCategoryDialogOpen}>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Categories</DialogTitle>
                <DialogDescription>
                  Manage categories for {movieDetail.title}
                </DialogDescription>
              </DialogHeader>
              <div className='mt-2'>
                <CategorySelector
                  selectedCategoryIds={selectedCategoryIds}
                  onCategoryChange={setSelectedCategoryIds}
                  allowCategoryDeletion={false}
                />
              </div>
              <div className='mt-4 flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size='sm' onClick={handleSaveCategories}>
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <p className='text-xs font-normal'>{movieDetail.plot}</p>

          {/* Bottom Action Bar - Overlay */}
          <div
            className='absolute bottom-0 left-0 right-0 flex justify-center gap-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-blue-900/80 via-blue-900/60 to-transparent'
            onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 text-white'
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(movieDetail.imdbID);
                    }}>
                    <Heart
                      className={`w-4 h-4 ${userStatus?.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='text-xs font-medium'>
                  <p>
                    {userStatus?.isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 text-white'
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatched?.(movieDetail.imdbID);
                    }}>
                    <Eye
                      className={`w-4 h-4 ${userStatus?.isWatched ? 'fill-blue-400 text-blue-400' : 'text-white'}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='text-xs font-medium'>
                  <p>{userStatus?.isWatched ? 'Watched' : 'Mark as Watched'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 text-white'
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryDialogOpen(true);
                    }}>
                    <Tags className='w-4 h-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='text-xs font-medium'>
                  <p>Manage Categories</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white'
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to delete "${movieDetail.title}"?`,
                        )
                      ) {
                        onDelete?.(movieDetail.imdbID);
                      }
                    }}>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='text-xs font-medium'>
                  <p>Delete from Library</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
