import { useEffect, useState } from "react";
import useTimeStore from "../../utilities/store/TimeStore";
const TimeBlock = ({ value, label }) => {
  return (
    <div className="
      flex flex-col items-center justify-center
      rounded-xl
      bg-secondary/30 backdrop-blur-md
      w-16 h-16
      sm:w-18 sm:h-18
      md:w-20 md:h-20
      lg:w-24 lg:h-24
    ">
      <span className="
        font-mono text-tertiary leading-none
        text-xl font-bold
        sm:text-2xl
        md:text-3xl
        lg:text-4xl
      ">
        {String(value).padStart(2, "0")}
      </span>

      <span className="
        text-primary font-bold uppercase tracking-widest
        mt-1
        text-[7px]
        sm:text-[8px]
        md:text-[9px]
        lg:text-[10px]
      ">
        {label}
      </span>
    </div>
  );
};

const CountDown = ({ remainingTime = 0 }) => {
  const [time, setTime] = useState(remainingTime);
  const { setTimeOver , timeOver } = useTimeStore();

  useEffect(() => {
    if (!remainingTime) return;

    setTime(remainingTime);

    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  useEffect(()=>{
    console.log("Time : ",time);
    console.log("Time Over : ",timeOver);
    if(timeOver == false && time == 0 && time){
      console.log("Update Time Over");
      setTimeOver(true);
    }
  },[time]);

  const days = Math.floor(time / 86400);
  const hours = Math.floor((time % 86400) / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (
    <div className="
      flex items-center justify-center
      flex-wrap
      gap-2 sm:gap-3 md:gap-4 pb-18
    ">
      <TimeBlock value={days} label="Days" />
      <TimeBlock value={hours} label="Hours" />
      <TimeBlock value={minutes} label="Min" />
      <TimeBlock value={seconds} label="Sec" />
    </div>
  );
};

export default CountDown;