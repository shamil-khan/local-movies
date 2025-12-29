import { useEffect, useState } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { XFileInput, type XFile } from '@/components/mine/xfileinput';
import { type MovieFile } from '@/types/MovieFile';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { movieService } from '@/services/MovieService';
import { logger } from '@/core/logger';
import type { MovieDetail } from '@/types/MovieDetail';

export const FolderReader = () => {
  const [files, setFiles] = useState<XFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [movieFiles, setMovieFiles] = useState<MovieFile[]>([]);

  useEffect(() => {
    logger.info(`Files state updated: ${files.length}`);
    if (files.length === 0) return;

    const movieFiles: MovieFile[] = toMovieFiles(files.map((f) => f.name));
    movieFiles.forEach((file) => {
      try {
        logger.info(file);
        // const response = await movieService.getMovieByTitle(file.name);
        // movieFile.movieDetail = response.data;
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    setMovieFiles(movieFiles);
  }, [files]);

  const handleUpload = (files: XFile[]) => setFiles(files);

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Select Movies Folder</CardTitle>
        <CardDescription>
          Select the movies folder from your local machine to upload and process
          its contents.
        </CardDescription>
        <CardAction>
          <XFileInput text='Movies' onUpload={handleUpload} folder />
        </CardAction>
      </CardHeader>
      {/* The webkitdirectory attribute enables folder selection */}
      <CardContent>
        <div style={{ marginTop: '20px' }}>
          <h4>Movies Found: {movieFiles.length}</h4>
          <ul>
            {movieFiles.map((m, index) => (
              <li key={index}>
                {m.title} <strong>({m.year})</strong>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
