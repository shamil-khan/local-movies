import { type MovieDetail } from '@/types/MovieDetail';

export interface MovieFile {
  title: string;
  year: number;
  ext: string;
  filename: string;
  movieDetail?: MovieDetail;
}
