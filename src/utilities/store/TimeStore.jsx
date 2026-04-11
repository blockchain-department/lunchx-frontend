import { create } from "zustand";

const useTimeStore = create((set) => ({
    timeOver: false,
    setTimeOver: (value) => set({ timeOver: value }),
}));

export default useTimeStore;