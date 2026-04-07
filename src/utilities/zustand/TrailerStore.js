import { create } from 'zustand'

export const useTrailerStore = create((set) => ({
  toggle: false,
  updateToggle: (toggle) => set({ toggle }),
}));
