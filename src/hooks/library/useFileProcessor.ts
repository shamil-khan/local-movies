import { useState, useEffect, useRef, useCallback } from 'react';
import { type XFile } from '@/components/mine/xfileinput';
import { type ExtractedTitle } from '@/models/AppModels';
import { useMovieFolderLoader } from '@/hooks/useMovieFolderLoader';
import { toMovieFiles } from '@/utils/MovieFileHelper';
import { type MovieDetail } from '@/models/MovieModel';

interface UseFileProcessorProps {
  movies: MovieDetail[];
  onMoviesUpdated: () => void;
}

export const useFileProcessor = ({
  movies,
  onMoviesUpdated,
}: UseFileProcessorProps) => {
  const [selectedFiles, setSelectedFiles] = useState<XFile[]>([]);
  const [extractedTitles, setExtractedTitles] = useState<ExtractedTitle[]>([]);
  const [successTitles, setSuccessTitles] = useState<ExtractedTitle[]>([]);
  const [failedTitles, setFailedTitles] = useState<ExtractedTitle[]>([]);
  const [filesToProcess, setFilesToProcess] = useState<XFile[]>([]);
  const [
    selectedCategoryIdsForProcessing,
    setSelectedCategoryIdsForProcessing,
  ] = useState<number[]>([]);

  // Use ref to access latest extractedTitles in callback to avoid stale closure
  const extractedTitlesRef = useRef<ExtractedTitle[]>([]);
  useEffect(() => {
    extractedTitlesRef.current = extractedTitles;
  }, [extractedTitles]);

  const { loading: folderLoading, error: folderError } = useMovieFolderLoader(
    filesToProcess,
    (details, processedFiles, metaByFilename) => {
      const successes: ExtractedTitle[] = [];
      const failures: ExtractedTitle[] = [];
      const originalTitles = extractedTitlesRef.current;

      processedFiles.forEach((pf) => {
        const originalTitle = originalTitles.find(
          (et) => et.filename === pf.filename,
        );

        const matchDetail = details.find((d) => d.Response === 'True');

        const meta = metaByFilename[pf.filename];

        const statusItem: ExtractedTitle = originalTitle
          ? {
              ...originalTitle,
              inDb: !!matchDetail,
              rawDetail: meta?.detail ?? originalTitle.rawDetail,
              error: meta?.error ?? originalTitle.error,
            }
          : {
              title: pf.title,
              filename: pf.filename,
              originalFile: { name: pf.filename, path: '', size: 0 },
              inDb: !!matchDetail,
              year: Number.isNaN(pf.year) ? undefined : pf.year,
              rawDetail: meta?.detail,
              error: meta?.error,
            };

        if (matchDetail) {
          successes.push({ ...statusItem, inDb: true });
        } else {
          failures.push(statusItem);
        }
      });

      setSuccessTitles((prev) => [...prev, ...successes]);
      setFailedTitles((prev) => [...prev, ...failures]);

      // Reset
      setSelectedFiles([]);
      setExtractedTitles([]);
      setFilesToProcess([]);

      // Trigger refresh
      onMoviesUpdated();
    },
    selectedCategoryIdsForProcessing,
  );

  // Effect to extract titles when selectedFiles changes
  useEffect(() => {
    const extractTitles = async () => {
      if (selectedFiles.length === 0) {
        setExtractedTitles([]);
        return;
      }

      const movieFiles = toMovieFiles(selectedFiles.map((f) => f.name));
      const newExtractedTitles: ExtractedTitle[] = [];
      const seenTitles = new Set<string>();

      for (const mf of movieFiles) {
        if (seenTitles.has(mf.title.toLowerCase())) {
          continue;
        }
        seenTitles.add(mf.title.toLowerCase());

        const originalFile = selectedFiles.find((f) => f.name === mf.filename);
        if (!originalFile) continue;

        const existingMovie = movies.find(
          (m) => m.Title.toLowerCase() === mf.title.toLowerCase(),
        );

        newExtractedTitles.push({
          title: mf.title,
          filename: mf.filename,
          originalFile: originalFile,
          inDb: !!existingMovie,
          year: Number.isNaN(mf.year) ? undefined : mf.year,
        });
      }
      setExtractedTitles(newExtractedTitles);
    };

    extractTitles();
  }, [selectedFiles, movies]);

  const handleProcessTitles = useCallback(
    (categoryIds?: number[]) => {
      const files = extractedTitles.map((t) => t.originalFile);
      setSelectedCategoryIdsForProcessing(categoryIds || []);
      setFilesToProcess(files);
    },
    [extractedTitles],
  );

  const handleRemoveFile = useCallback((file: XFile) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== file));
  }, []);

  const handleRemoveTitle = useCallback((titleItem: ExtractedTitle) => {
    setExtractedTitles((prev) => prev.filter((t) => t !== titleItem));
  }, []);

  const handleRemoveSuccessTitle = useCallback((t: ExtractedTitle) => {
    setSuccessTitles((prev) => prev.filter((x) => x !== t));
  }, []);

  const handleRemoveFailedTitle = useCallback((t: ExtractedTitle) => {
    setFailedTitles((prev) => prev.filter((x) => x !== t));
  }, []);

  const resetState = useCallback(() => {
    setSelectedFiles([]);
    setExtractedTitles([]);
    setSuccessTitles([]);
    setFailedTitles([]);
    setFilesToProcess([]);
  }, []);

  return {
    selectedFiles,
    setSelectedFiles,
    extractedTitles,
    successTitles,
    failedTitles,
    folderLoading,
    folderError,
    handleProcessTitles,
    handleRemoveFile,
    handleRemoveTitle,
    handleRemoveSuccessTitle,
    handleRemoveFailedTitle,
    resetState,
  };
};
