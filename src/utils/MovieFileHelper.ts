import { type MovieFile, type MovieDetail } from '@/models/MovieModel';
import { type OmdbMovieResult } from '@/services/OmdbApiService';
import { MovieAttributes, MovieExtensions } from '@/utils/MovieAttributes';
import { logger } from '@/core/logger';

function removeWordsFromString(
  originalString: string,
  wordsToRemove: string[],
): string {
  // Escape special characters in the words to build a safe regex
  const escapedWords = wordsToRemove.map((word) =>
    word.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );

  // Join the words with '|' to create a regex alternation group
  const pattern = '\\b(' + escapedWords.join('|') + ')\\b';
  const regex = new RegExp(pattern, 'gi'); // 'g' for global, 'i' for case-insensitive

  // Replace the matched words with a single space
  let result = originalString.replace(regex, ' ');

  // Clean up any resulting multiple spaces and trim leading/trailing spaces
  result = result.replace(/\s{2,}/g, ' ').trim();

  return result;
}

export const toMovieFile = (fileName: string): MovieFile | undefined => {
  const extMatch = fileName.match(/\.(\w+)$/);
  if (!extMatch) {
    logger.warn(`No extension found for filename: ${fileName}`);
    return undefined;
  }

  if (MovieExtensions.includes(extMatch[1].toLowerCase())) {
    logger.warn(`The given ${fileName} is not a valid movie extension.`);
    return undefined;
  }

  const title = removeWordsFromString(fileName, MovieAttributes)
    .replace(/[._-]/g, ' ')
    .replace(/[[\]()]/g, ' ')
    .trim();

  const yearMatch = title.match(/(\d{4})$/);

  // logger.info(
  //   `Parsing extension for filename: ${filename}, found => ${movieName}==${extMatch?.[1]}==${yearMatch?.[1]}`,
  // );
  return {
    fileName: fileName,
    title: yearMatch ? title.replace(/(\d{4})$/, '').trim() : title,
    year: yearMatch ? parseInt(yearMatch[1]) : NaN,
  };
};

export const toMovieFiles = (filenames: string[]): MovieFile[] => {
  if (filenames.length === 0) return [];

  const movieFiles = filenames
    .map((filename) => toMovieFile(filename))
    .filter((movieFile) => movieFile !== undefined)
    .toSorted((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
    );

  logger.info(`Parsed ${movieFiles.length} movie files from provided files.`);
  return movieFiles;
};

export async function compressImageBuffer(
  data: ArrayBuffer,
  headerType: string | undefined,
  quality: number = 0.3,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([data], { type: headerType });
    const imageUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      const { width, height } = img;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          // Revoke the object URL to free up memory
          URL.revokeObjectURL(imageUrl);

          if (compressedBlob) {
            console.log(`Original image size: ${blob.size} bytes`);
            console.log(`Compressed image size: ${compressedBlob.size} bytes`);
            console.log(
              `Size reduction: ${(((blob.size - compressedBlob.size) / blob.size) * 100).toFixed(2)}%`,
            );
            resolve(compressedBlob);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(imageUrl);
      reject(err);
    };
  });
}

export const toMovieDetail = (omdbResult: OmdbMovieResult): MovieDetail => {
  return {
    imdbID: omdbResult.imdbID,
    title: omdbResult.Title,
    year: omdbResult.Year,
    rated: omdbResult.Rated,
    runtime: omdbResult.Runtime,
    genre: omdbResult.Genre,
    plot: omdbResult.Plot,
    language: omdbResult.Language,
    country: omdbResult.Country,
    awards: omdbResult.Awards,
    poster: omdbResult.Poster,
    metascore: omdbResult.Metascore,
    imdbRating: omdbResult.imdbRating,
    imdbVotes: omdbResult.imdbVotes,
    type: omdbResult.Type,
  };
};
