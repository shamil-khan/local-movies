import { create } from 'zustand';

interface FileProcessingState {
  selectedCategoryIds: number[];
  setSelectedCategoryIds: (ids: number[]) => void;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  toggleShowDetails: () => void;
}

export const useFileProcessingStore = create<FileProcessingState>((set) => ({
  selectedCategoryIds: [],
  setSelectedCategoryIds: (ids: number[]) => set({ selectedCategoryIds: ids }),
  showDetails: false,
  setShowDetails: (v: boolean) => set({ showDetails: v }),
  toggleShowDetails: () => set((s) => ({ showDetails: !s.showDetails })),
}));
