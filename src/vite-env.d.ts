interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly VITE_YOUTUBE_URL: string;
  readonly VITE_IMDB_URL: string;
  readonly VITE_OMDB_API_URL: string;
  readonly VITE_TMDB_API_URL: string;
  readonly VITE_TMDB_IMAGE_URL: string;
  readonly VITE_OMDB_API_KEY: string;
  readonly VITE_TMDB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
