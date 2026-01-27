import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { ImdbLink } from '@/components/ImdbLink';
import { type MovieInfo } from '@/models/MovieModel';
import { tmdbApiService, type MovieTrailer } from '@/services/TmdbApiService';
import logger from '@/core/logger';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { YouTubeIcon } from '@/components/YoutubeIcon';

interface TrailerDialogProps {
  movie: MovieInfo;
  open: boolean;
  onClose: () => void;
}

const Youtube_Site_Embed = 'https://www.youtube.com/embed/';
const Youtube_Site_Search = 'https://www.youtube.com/results?search_query=';

export const TrailerDialog = ({ movie, open, onClose }: TrailerDialogProps) => {
  const [searchYT, setSearchYT] = useState<string>('');
  const [trailer, setTrailer] = useState<MovieTrailer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // suggestions for autocomplete based on stored search history
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasTyped, setHasTyped] = useState(false);

  // Load last search from history when dialog opens
  useEffect(() => {
    if (open) {
      try {
        const history = JSON.parse(
          localStorage.getItem('trailerDialogSearchHistory') ?? '[]',
        );
        if (Array.isArray(history) && history.length > 0) {
          setSearchYT(history[history.length - 1]);
        }
      } catch (e) {
        console.error('Failed to load search history', e);
      }
    }
  }, [open]);

  // Update suggestions whenever the search input changes
  useEffect(() => {
    if (!open || !hasTyped) {
      setSuggestions([]);
      return;
    }
    const storageKey = 'trailerDialogSearchHistory';
    try {
      const history: string[] = JSON.parse(
        localStorage.getItem(storageKey) ?? '[]',
      );
      const filtered = history.filter(
        (s) =>
          s.toLowerCase().includes(searchYT.toLowerCase()) && s.trim() !== '',
      );
      // Show most recent matches first, limit to 5
      setSuggestions(filtered.slice(-5).reverse());
    } catch (e) {
      console.error('Failed to filter suggestions', e);
      setSuggestions([]);
    }
  }, [searchYT, open, hasTyped]);

  useEffect(() => {
    if (!open || trailer || loading) {
      return;
    }

    const loadTrailer = async () => {
      setLoading(true);
      setError(null);

      try {
        logger.info(`Fetching trailer for IMDb ID: ${movie.imdbID}`);
        const trailerData = await tmdbApiService.getTrailerByImdbId(
          movie.imdbID,
        );

        if (trailerData) {
          setTrailer(trailerData);
          logger.success(`Trailer found: ${trailerData.name}`);
        } else {
          setError('No trailer available for this movie');
          logger.warn(`No trailer found for: ${movie.title}`);
        }
      } catch (err) {
        setError('Failed to load trailer');
        logger.error('Error fetching trailer:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadTrailer();
  }, [open, trailer, movie.imdbID, movie.title]);

  const encodeSearchMovie = (value: string) =>
    [movie.title, movie.detail.year, 'Movie', value]
      .join(' ')
      .trim()
      .replaceAll(' ', '+');

  const handleSearchYoutube = async () => {
    const searchable = encodeSearchMovie(searchYT);

    const url = `${Youtube_Site_Search}${searchable}`;
    logger.info(`Youtube Search Triggered ${searchable}`);

    // Update search history in localStorage
    const storageKey = 'trailerDialogSearchHistory';
    try {
      const existing: string[] = JSON.parse(
        localStorage.getItem(storageKey) ?? '[]',
      );
      const updated = [...existing, searchYT].filter(Boolean);
      const unique = Array.from(new Set(updated));
      const limited = unique.slice(-5);
      localStorage.setItem(storageKey, JSON.stringify(limited));
    } catch (e) {
      console.error('Failed to update search history', e);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenChange = () => {
    setTrailer(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* No Trigger - Controlled by state */}
      <DialogContent className='md:max-w-110 lg:max-w-200 border-white/40 bg-white/60 p-0 backdrop-blur-3xl shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden'>
        <div className='flex flex-col h-full'>
          <DialogHeader className='p-3 flex flex-col items-start justify-between border-b border-zinc-200/50 gap-4'>
            <div className='w-full flex flex-col gap-1.5'>
              <DialogTitle className='w-full text-lg lg:text-2xl md:text-sm font-black tracking-tight text-zinc-950 flex items-baseline gap-2'>
                {movie.title}
                {movie.year && (
                  <span className='text-lg lg:text-2xl md:text-sm font-bold text-zinc-700 tracking-tighter'>
                    ({movie.year})
                  </span>
                )}
              </DialogTitle>

              <p className='text-xs font-bold text-zinc-800 uppercase tracking-tight flex items-center gap-2'>
                <span className='text-red-600 font-black'>FEATURED:</span>
                {trailer?.name ||
                  (loading ? 'LOCATING TRAILER...' : 'TRAILER NOT FOUND')}
              </p>
            </div>

            <div className='hidden lg:flex flex-col items-end gap-3 shrink-0'>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded'>
                  ID: {movie.imdbID}
                </span>

                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black text-emerald-700 border border-emerald-200'>
                  <div className='h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse' />
                  {trailer?.official ? '' : 'NOT'} VERIFIED OFFICIAL
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* 2. Video Player: Cinema-Ready Aspect Ratio */}
          <div className='relative aspect-video w-full bg-zinc-100 group/video'>
            {loading && (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md z-30'>
                <div className='relative flex items-center justify-center'>
                  <Loader2 className='w-10 h-10 animate-spin text-zinc-900' />
                  <div className='absolute inset-0 w-10 h-10 border-2 border-zinc-200 rounded-full' />
                </div>
                <p className='text-xs font-black text-zinc-900 tracking-widest uppercase'>
                  Initializing Theatre
                </p>
              </div>
            )}

            {!loading && !error && trailer?.youtubeKey && (
              <iframe
                className='w-full h-full shadow-inner animate-in fade-in zoom-in-95 duration-700'
                src={`${Youtube_Site_Embed}/${trailer.youtubeKey}?autoplay=1&modestbranding=1`}
                title={trailer.name}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            )}

            {!loading && error && (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md'>
                <div className='text-sm lg:text-lg font-medium text-zinc-900 tracking-normal p-4'>
                  {movie.title} {movie.year ? `(${movie.year})` : ''} trialer is
                  not avaiable.
                </div>
                <div className='text-sm lg:text-lg animate-pulse font-bold text-zinc-900 tracking-widest p-4'>
                  <a
                    href={`${Youtube_Site_Search}${encodeSearchMovie('Trailer')}`}
                    target='_blank'
                    rel='noopener noreferrer'>
                    Click here to watch trailer on youtube.
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 3. The "Light-Mode" Action Dock */}
          <div className='p-6 bg-white/40 border-t border-zinc-100'>
            <div className='relative flex items-center gap-3 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-zinc-200 focus-within:ring-2 focus-within:ring-red-500/30 transition-all'>
              <div className='pl-2 border-r border-zinc-100 pr-3'>
                <ImdbLink imdbID={movie.imdbID} title={movie.title} size='md' />
              </div>
              <Input
                type='search'
                placeholder='Search critics or explanation on YouTube...'
                value={searchYT}
                onChange={(e) => {
                  setSearchYT(e.target.value);
                  if (!hasTyped) setHasTyped(true);
                }}
                className='h-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400'
              />
              {/* Autocomplete dropdown */}
              {suggestions.length > 0 && (
                <ul className='absolute bottom-full left-0 mb-1 max-h-48 w-full overflow-y-auto rounded bg-white shadow-lg border border-zinc-200 z-40'>
                  {suggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className='px-3 py-2 hover:bg-zinc-100 cursor-pointer text-sm text-zinc-800'
                      onMouseDown={() => {
                        setSearchYT(s);
                        setSuggestions([]);
                      }}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                onClick={handleSearchYoutube}
                className='group/yt relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-red-600 shadow-lg transition-all hover:bg-red-700 active:scale-90'>
                <div className='absolute inset-0 translate-x-[-100%] bg-linear-to-r from-transparent via-white/40 to-transparent group-hover/yt:animate-shimmer' />
                <YouTubeIcon className='relative z-10 w-5 h-5 fill-white' />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
