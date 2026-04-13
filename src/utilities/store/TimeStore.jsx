import { create } from "zustand";

const useTimeStore = create((set) => ({
    timeOver: false,
    time: null,
    setTimeOver: (value) => set({ timeOver: value }),
    setTime: (value) => set({ time: value }),
    tick: () =>
        set((state) => {
            if (state.time <= 1) {
                return { time: 0, timeOver: true }; // ✅ Atomic update
            }
            return { time: state.time - 1 };
        }),
}));

export default useTimeStore;