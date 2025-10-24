import React, { useEffect, useState } from "react";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const formatDateTime = (date: Date) => {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const CountdownTimer = ({ startTime, targetTime }: { startTime: string | Date; targetTime: string | Date }) => {
  const start = new Date(startTime);
  const end = new Date(targetTime);
  const { language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(end));

  // Translation hooks
  const auctionWillStartText = useAutoTranslation("Auction will start on", language);
  const timesUpText = useAutoTranslation("Time's up", language);
  const hText = useAutoTranslation("h", language);
  const mText = useAutoTranslation("m", language);
  const sText = useAutoTranslation("s", language);
  const dayText = useAutoTranslation("day", language);
  const daysText = useAutoTranslation("days", language);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(end));
    }, 1000);

    return () => clearInterval(timer);
  }, [end]);

  const { hrs, mins, secs, finished, totalMs } = timeRemaining;
  const daysDecimal = totalMs > 0 ? (totalMs / (1000 * 60 * 60 * 24)).toFixed(2) : "0";

  const now = new Date();

  return (
    <div className="relative group">
      <div className="absolute top-4 right-4 font-semibold bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-80 text-gray-900 dark:text-gray-100 text-[9px] px-3 py-1 rounded-[5px] flex flex-col items-end space-y-1">
        {now < start && <div className="text-gray-600 dark:text-gray-300">{auctionWillStartText}</div>}
        <div className="text-gray-900 dark:text-gray-100">{now < start ? formatDateTime(start) : finished ? timesUpText : `${hrs}${hText} ${mins}${mText} ${secs}${sText}`}</div>
      </div>

      {!finished && now >= start && (
        <div className="absolute top-full mt-1 right-4 hidden group-hover:block text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 shadow-md dark:shadow-gray-700/50 z-10">
          {daysDecimal} {parseFloat(daysDecimal) !== 1 ? daysText : dayText}
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
