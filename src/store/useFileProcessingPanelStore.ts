import { create } from 'zustand';

interface FileProcessingPanelState {
  categoryIds: number[];
  setCategoryIds: (ids: number[]) => void;
  showPanel: boolean;
  setShowPanel: (v: boolean) => void;
  toggleShowPanel: () => void;
}

export const useFileProcessingPanelStore = create<FileProcessingPanelState>(
  (set) => ({
    categoryIds: [],
    setCategoryIds: (ids: number[]) => set({ categoryIds: ids }),
    showPanel: false,
    setShowPanel: (v: boolean) => set({ showPanel: v }),
    toggleShowPanel: () => set((s) => ({ showPanel: !s.showPanel })),
  }),
);
