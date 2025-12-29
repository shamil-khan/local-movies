export interface MovieFile {
  imdbID?: string;
  title: string;
  year: number;
  ext: string;
  filename: string;
}

export const movieFileSchema = {
  title: 'title',
  year: 'year',
  ext: 'ext',
  filename: 'filename',
};
