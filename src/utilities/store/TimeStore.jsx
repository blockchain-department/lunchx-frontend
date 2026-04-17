import { create } from "zustand";

const useTimeStore = create((set) => ({
    timeOver: false,
    vestingOver: false,
    presaleProgress: 0,
    started: false,
    updateAll : () => set({timeOver: true, vestingOver: true}),
    setPresaleProgress: (value) => set({ presaleProgress: value }),
    setTimeOver: (value) => set({ timeOver: value }),
    setVestingOver: (value) => set({ vestingOver: value }),
    setStarted : (value) => set({ started: value }),
}));

export default useTimeStore;