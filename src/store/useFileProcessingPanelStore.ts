import { create } from 'zustand';

interface FileProcessingPanelState {
  panelVisible: boolean;
  closePanel: () => void;
  togglePanel: () => void;
}

export const useFileProcessingPanelStore = create<FileProcessingPanelState>(
  (set) => ({
    panelVisible: false,
    closePanel: () => set({ panelVisible: false }),
    togglePanel: () => set((s) => ({ panelVisible: !s.panelVisible })),
  }),
);
