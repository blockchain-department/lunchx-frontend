import { create } from "zustand";

const useTimeStore = create((set) => ({
    timeOver: false,
    vestingOver: false,
    time: null,
    presaleProgress: 0,
    setPresaleProgress: (value) => set({ presaleProgress: value }),
    setTimeOver: (value) => set({ timeOver: value }),
    setTime: (value) => set({ time: value }),
    setVestingOver: (value) => set({ vestingOver: value }),
    tick: () =>
        set((state) => {
            if(state.presaleProgress == 3){
                console.log("presale fail progress update");
                return { time: 0, timeOver: true, vestingOver: true }; // ✅ Atomic update
            }
            if(state.presaleProgress == 2 && state.timeOver == false){
                console.log("presale success progress update");
                return { time: 0, timeOver: true }; // ✅ Atomic update
            }
            if (state.time <= 1 && state.timeOver == false) {
                console.log("presale end update");
                return { time: 0, timeOver: true }; // ✅ Atomic update
            }
            if(state.time <= 1 && state.vestingOver == false) {
                console.log("vesting end update");
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