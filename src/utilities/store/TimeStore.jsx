import { create } from "zustand";

const useTimeStore = create((set) => ({
    timeOver: false,
    vestingOver: false,
    time: null,
    setTimeOver: (value) => set({ timeOver: value }),
    setTime: (value) => set({ time: value }),
    tick: () =>
        set((state) => {
            if (state.time <= 1 && state.timeOver == false) {
                return { time: 0, timeOver: true }; // ✅ Atomic update
            }
            if(state.time <= 1 && state.vestingOver == false) {
                return { time: 0, vestingOver: true }; // ✅ Atomic update
            }
            if(state.time > 0){
                return { time: state.time - 1 };
            }else{
                return { time: 0 };
            }
        }),
}));

export default useTimeStore;