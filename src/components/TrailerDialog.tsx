import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, AlertCircle, Search } from 'lucide-react';
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

const Youtube_Site_Link = 'https://www.youtube.com';
const Youtube_Site_Embed = `${Youtube_Site_Link}/embed/`;

export const TrailerDialog = ({ movie, open, onClose }: TrailerDialogProps) => {
  const [searchYT, setSearchYT] = useState<string>('');
  const [trailer, setTrailer] = useState<MovieTrailer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [open, trailer, loading, movie.imdbID, movie.title]);

  const handleSearchYoutube = async () => {
    const searchable = [movie.title, movie.detail.year, searchYT]
      .join(' ')
      .trim()
      .replaceAll(' ', '+');

    const url = `${Youtube_Site_Link}/results?search_query=${searchable}`;
    logger.info(`Youtube Search Triggered ${searchable}`);

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
      <DialogContent className='sm:max-w-[700px] max-w-4xl border-white/40 bg-white/60 p-0 backdrop-blur-3xl shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden'>
        <div className='flex flex-col h-full'>
          {/* 1. Header: Bold High-Contrast Typography */}
          <DialogHeader className='p-6 pb-5 flex flex-row items-end justify-between border-b border-zinc-200/50'>
            <div className='flex flex-col gap-1.5'>
              <DialogTitle className='text-3xl font-black tracking-tight text-zinc-950 flex items-baseline gap-2'>
                {movie.title}
                {/* Increased visibility for Year: Using zinc-700 instead of 500 */}
                <span className='text-lg font-bold text-zinc-700 tracking-tighter'>
                  ({movie.detail.year})
                </span>
              </DialogTitle>

              {/* Visibility Fix: High-contrast sub-header */}
              <p className='text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-2'>
                <span className='text-red-600 font-black'>FEATURED:</span>
                {trailer?.name ||
                  (loading ? 'LOCATING TRAILER...' : 'TRAILER NOT FOUND')}
              </p>
            </div>

            <div className='flex flex-col items-end gap-3 shrink-0'>
              <div className='flex items-center gap-2'>
                {/* Metadata: Using monospace for technical depth */}
                <span className='text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded'>
                  ID: {movie.imdbID}
                </span>

                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black text-emerald-700 border border-emerald-200'>
                  <div className='h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse' />
                  {trailer?.official ? '' : 'NOT'} 'VERIFIED OFFICIAL'
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
          </div>

          {/* 3. The "Light-Mode" Action Dock */}
          <div className='p-6 bg-white/40 border-t border-zinc-100'>
            <div className='flex items-center gap-3 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-zinc-200 focus-within:ring-2 focus-within:ring-red-500/30 transition-all'>
              <div className='pl-2 border-r border-zinc-100 pr-3'>
                <ImdbLink imdbID={movie.imdbID} title={movie.title} size='md' />
              </div>
              <Input
                type='search'
                placeholder='Search critics or explanation on YouTube...'
                value={searchYT}
                onChange={(e) => setSearchYT(e.target.value)}
                className='h-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400'
              />
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
