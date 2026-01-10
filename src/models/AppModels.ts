export interface FilterCriteria {
  query: string;
  genre: string[];
  year: string[];
  rating: string[];
  rated: string[];
  language: string[];
  country: string[];
  category: string[];
  isFavorite: boolean;
  isWatched: boolean;
}

import type { MovieDetail } from '@/models/MovieModel';

export interface ExtractedTitle {
  title: string;
  filename: string;
  originalFile: {
    name: string;
    path: string;
    size: number;
  };
  inDb: boolean;
  year?: number;
  rawDetail?: MovieDetail;
  error?: string;
}
