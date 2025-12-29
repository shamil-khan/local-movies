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
import { movieService, type MovieDetail } from '@/services/MovieService';
import { logger } from '@/lib/logger';

interface MovieFile {
  name: string;
  year: number;
  ext: string;
  xFile: XFile;
  movieDetail?: MovieDetail;
}

const MovieExtensions = [
  'mp4',
  'mkv',
  'avi',
  'mov',
  'wmv',
  'flv',
  'webm',
  'mpeg',
  'mpg',
  '3gp',
  'ts',
];

const MovieRappers = [
  'BOKUTOX',
  'VLiS',
  'VLiST',
  'GalaxyRG',
  'GalaxyRG2',
  'MGH',
  'FGT',
  'YIFY',
  'RARBG',
  'ETRG',
  'LOL',
  'KiNGDOM',
  'SPARKS',
  'BATV',
  'EVO',
  'CM8',
  'KILLERS',
  'DIMENSION',
  'FQM',
  'AMIABLE',
  'CTRLHD',
  'MZABI',
  'NOGRP',
  'PLAYNOW',
  'PSA',
  'REWARD',
  'SKIDROW',
  'TASTE',
  'TiTAN',
  'VXT',
  'YTS.MX',
  'YTS.AM',
  'YTS.AG',
  'YTS.LT',
  'YTS',
  'ETRG',
  'RARBG',
  'Ganool',
  'EVO',
  'CMRG',
  'KILLERS',
  'BATV',
  'SPARKS',
  'AMIABLE',
  'CTRLHD',
  'DIMENSION',
  'FQM',
  'LOL',
  'MZABI',
  'NOGRP',
  'PLAYNOW',
  'PSA',
  'RARBG',
  'REWARD',
  'SKIDROW',
  'TASTE',
  'TiTAN',
  'VXT',
];

const MovieSizes = ['450MB', '800MB', '1GB', '1.5GB', '2GB', '3GB', '4GB'];
const MovieQualities = ['HD', 'FullHD', '4K', '8K', 'SD'];
const MovieSources = [
  'HDRip',
  'BluRay',
  'WEBRip',
  'DVDRip',
  'HDTV',
  'BRRip',
  'CAM',
  'DVDScr',
  'WEB-DL',
  'HDTS',
  'HDMA',
];
const MovieLanguages = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Italian',
  'RUSSIAN',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
];
const MovieShortLanguages = ['ENG', 'HIN', 'SPA', 'FRE', 'GER', 'ITA'];
const MovieAudioTypes = [
  'DTS',
  'AC3',
  'AAC',
  'DD5.1',
  'Dolby Atmos',
  'TrueHD',
  'FLAC',
  'MP3',
  'WAV',
  'OGG',
  '5.1',
  '2.0',
  '7.1',
  'EAC3',
];
const MovieVideoCodecs = [
  'H264',
  'H265',
  'x264',
  'x265',
  'HEVC',
  'AVC',
  'VP9',
  'AV1',
  'ProRes',
];
const MovieReleaseTypes = [
  'PROPER',
  'REMASTERED',
  'LIMITED',
  'UNRATED',
  'SUBBED',
  'EXTENDED',
  'DIRECTORS CUT',
  'THEATRICAL',
  'INTERNAL',
  'READNFO',
  'CRITERION',
];
const MovieResolutions = ['1080p', '720p', '480p', '4K', '8K'];
const MovieFrameRates = ['24fps', '30fps', '60fps', '120fps'];
const MovieSubs = ['ESub', 'HSub', 'FSub', 'DSub', 'ISub', 'ASub'];

const MovieOtherTags = [
  'Audio',
  'Dual',
  'MULTi',
  'SUB',
  'LiNE',
  'UNRATED',
  'READNFO',
  'REPACK',
  'iNTERNAL',
  'THEATRICAL',
  'DC',
  'AAC5.1',
  '10bit',
];

const MovieAttributes = [
  ...MovieExtensions,
  ...MovieRappers,
  ...MovieSizes,
  ...MovieSources,
  ...MovieLanguages,
  ...MovieShortLanguages,
  ...MovieVideoCodecs,
  ...MovieReleaseTypes,
  ...MovieResolutions,
  ...MovieAudioTypes,
  ...MovieFrameRates,
  ...MovieQualities,
  ...MovieFrameRates,
  ...MovieSubs,
  ...MovieOtherTags,
];

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

const toMovieFile = (xFile: XFile): MovieFile | undefined => {
  const extMatch = xFile.name.match(/\.(\w+)$/);
  if (!extMatch) {
    logger.warn(`No extension found for filename: ${xFile.name}`);
    return undefined;
  }

  const movieName = removeWordsFromString(xFile.name, MovieAttributes)
    .replace(/[._-]/g, ' ')
    .replace(/[[\]()]/g, ' ')
    .trim();

  const yearMatch = movieName.match(/(\d{4})$/);

  // logger.info(
  //   `Parsing extension for filename: ${xFile.name}, found => ${movieName}==${extMatch?.[1]}==${yearMatch?.[1]}`,
  // );
  return {
    name: yearMatch ? movieName.replace(/(\d{4})$/, '').trim() : movieName,
    year: yearMatch ? parseInt(yearMatch[1]) : NaN,
    ext: extMatch[1],
    xFile: xFile,
  };
};

const getMovieFiles = (files: XFile[]): MovieFile[] => {
  if (files.length === 0) return [];

  const movieFiles = files
    .map((xFile) => toMovieFile(xFile))
    .filter((movieFile) => movieFile !== undefined)
    .filter((movieFile) =>
      MovieExtensions.includes(movieFile.ext.toLowerCase()),
    )
    .toSorted((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );

  logger.info(`Parsed ${movieFiles.length} movie files from uploaded files.`);
  return movieFiles;
};

export const FolderReader = () => {
  const [files, setFiles] = useState<XFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [movieFiles, setMovieFiles] = useState<MovieFile[]>([]);

  useEffect(() => {
    logger.info(`Files state updated: ${files.length}`);
    if (files.length === 0) return;

    const movieFiles: MovieFile[] = getMovieFiles(files);
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
                {m.name} <strong>({m.year})</strong>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
