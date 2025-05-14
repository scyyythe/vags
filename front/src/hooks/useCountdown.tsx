import React, { useEffect, useState } from "react";

const calculateTimeRemaining = (targetTime: string | Date) => {
  const now = new Date().getTime();
  const distance = new Date(targetTime).getTime() - now;

  const hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    hrs: hrs >= 0 ? hrs : 0,
    mins: mins >= 0 ? mins : 0,
    secs: secs >= 0 ? secs : 0,
    finished: distance <= 0,
  };
};

const CountdownTimer = ({ targetTime }: { targetTime: string | Date }) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(targetTime));

  useEffect(() => {
    if (timeRemaining.finished) return;

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining.finished, targetTime]);

  return (
    <div className="absolute top-4 right-4 font-semibold bg-white bg-opacity-60 text-black text-[9px] px-3 py-1 rounded-[3px]">
      {timeRemaining.finished ? (
        "Time’s up"
      ) : (
        <>
          {timeRemaining.hrs}h {timeRemaining.mins}m {timeRemaining.secs}s
        </>
      )}
    </div>
  );
};

export default CountdownTimer;
