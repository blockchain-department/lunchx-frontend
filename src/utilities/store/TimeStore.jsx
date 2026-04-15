import { create } from "zustand";

const useTimeStore = create((set) => ({
    timeOver: false,
    vestingOver: false,
    time: null,
    presaleProgress: 0,
    updateAll : () => set({timeOver: true, vestingOver: true, time: 0}),
    setPresaleProgress: (value) => set({ presaleProgress: value }),
    setTimeOver: (value) => set({ timeOver: value }),
    setTime: (value) => set({ time: value }),
    setVestingOver: (value) => set({ vestingOver: value }),
    tick: () =>
        set((state) => {
            if(state.time > 0){
                return { time: state.time - 1 };
            }else{
                if(state.timeOver == false){
                    return { timeOver: true };
                }
                if(state.timeOver == true && state.vestingOver == false){
                    return { vestingOver: true };
                }
                return {};
            }
        }),
}));

export default useTimeStore;