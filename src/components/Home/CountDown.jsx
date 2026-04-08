import { useEffect, useState } from "react";

const TimeBlock = ({ value, label }) => {
  return (
    <div className="
      flex flex-col items-center justify-center
      rounded-xl
      bg-tertiary/5 backdrop-blur-md
      w-14 h-14
      sm:w-16 sm:h-16
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
        text-tertiary/50 uppercase tracking-widest
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

  useEffect(() => {
    if (!remainingTime) return;

    setTime(remainingTime);

    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

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