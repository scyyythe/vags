import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
const calculateTimeRemaining = (targetTime: string | Date) => {
  const end = new Date(targetTime).getTime();
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { hrs: "00", mins: "00", secs: "00", finished: true };
  }

  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return {
    hrs: String(hrs).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
    finished: false,
  };
};

const CountdownDisplay = ({
  startTime,
  endTime,
  isMobile,
}: {
  startTime: string | Date;
  endTime: string | Date;
  isMobile: boolean;
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(endTime));
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endTime));
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const hasNotStarted = now < new Date(startTime);
  const hasEnded = now > new Date(endTime);

  if (hasNotStarted) {
    return (
      <div className="text-gray-600">
        <p className={cn(isMobile ? "text-[10px]" : "text-xs", "relative bottom-2")}>Auction will start on</p>
        <p className="text-xs font-semibold text-black mt-1">
          {new Date(startTime).toLocaleString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>
    );
  }

  if (hasEnded) {
    return <p className="text-sm text-gray-500">Auction has ended</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <span className={cn(isMobile ? "text-[10px]" : "text-xs mb-2", "text-black")}>Auction ends in</span>
      <div className="flex justify-center items-center gap-8">
        {["hrs", "mins", "secs"].map((unit, idx) => (
          <div key={unit} className="flex flex-col items-center">
            <span className="text-md font-bold text-[#990000]">{timeRemaining[unit]}</span>
            <span className="text-gray-500 text-[10px] mt-1">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownDisplay;
