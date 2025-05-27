import React, { useEffect, useState } from "react";
import { calculateTimeRemaining } from "@/utils/timeUtils";

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
    <div className="absolute top-4 right-4 font-semibold bg-white bg-opacity-60 text-black text-[9px] px-3 py-1 rounded-[5px]">
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
