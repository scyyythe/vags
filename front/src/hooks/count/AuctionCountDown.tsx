// components/AuctionCountdown.tsx
import React, { useEffect, useState } from "react";

const calculateTimeRemaining = (targetTime: string | Date) => {
  const end = new Date(targetTime).getTime();
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { hrs: "00", mins: "00", secs: "00", finished: true };
  }

  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return {
    hrs: String(hrs).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
    finished: false,
  };
};

const AuctionCountdown = ({ endTime }: { endTime: string | Date }) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex-1">
      <p className="text-[10px] text-gray-500 mb-1">Auction ends in</p>
      <div className="flex items-center justify-center gap-8  relative top-1">
        <div className="flex flex-col items-center">
          <div className="flex -mb-2">
            <p className="text-md font-semibold">{timeRemaining.hrs}</p>
            <p className="font-medium relative left-4">:</p>
          </div>
          <div><span className="text-[8px] text-gray-400">hrs</span></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex -mb-2">
            <p className="text-md font-semibold">{timeRemaining.mins}</p>
            <p className="font-medium relative left-4">:</p>
          </div>
          <div><span className="text-[8px] text-gray-400">mins</span></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex -mb-2">
            <p className="text-md font-semibold">{timeRemaining.secs}</p>
          </div>
          <div><span className="text-[8px] text-gray-400">secs</span></div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCountdown;
