import React, { useEffect, useState } from "react";

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

export interface AuctionCountdownProps {
  startTime: string | Date;
  endTime: string | Date;
  auctionEndsInText?: string;
  hrsText?: string;
  minsText?: string;
  secsText?: string;
  auctionWillStartOnText?: string;
  auctionHasEndedText?: string;
}

const AuctionCountdown: React.FC<AuctionCountdownProps> = ({
  startTime,
  endTime,
  auctionEndsInText = "Auction ends in",
  hrsText = "hrs",
  minsText = "mins",
  secsText = "secs",
  auctionWillStartOnText = "Auction will start on",
  auctionHasEndedText = "Auction has ended",
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
      <div className=" text-gray-600">
        <p className="text-[10px] relative bottom-2">{auctionWillStartOnText}</p>
        <p className="text-lg font-semibold text-black mt-1">
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
    return <p className="text-sm text-gray-500">{auctionHasEndedText}</p>;
  }

  // Ongoing auction
  return (
    <div className="flex-1">
      <p className="text-[10px] text-gray-500 mb-1">{auctionEndsInText}</p>
      <div className="flex items-center justify-center gap-8 relative top-1">
        <div className="flex flex-col items-center">
          <div className="flex -mb-2">
            <p className="text-lg font-semibold">{timeRemaining.hrs}</p>
            <p className="font-medium relative left-4">:</p>
          </div>
          <div>
            <span className="text-[9px] text-gray-400">{hrsText}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex -mb-2">
            <p className="text-lg font-semibold">{timeRemaining.mins}</p>
            <p className="font-medium relative left-4">:</p>
          </div>
          <div>
            <span className="text-[9px] text-gray-400">{minsText}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex -mb-2">
            <p className="text-lg font-semibold">{timeRemaining.secs}</p>
          </div>
          <div>
            <span className="text-[9px] text-gray-400">{secsText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCountdown;
