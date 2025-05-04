import { createContext, useContext, useState } from "react";

interface AuctionContextType {
  startDays: number;
  startHours: number;
  startMinutes: number;
  endDays: number;
  endHours: number;
  endMinutes: number;
  setAuctionTime: (type: "start" | "end", unit: string, value: number) => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: React.ReactNode }) => {
  const [startDays, setStartDays] = useState(0);
  const [startHours, setStartHours] = useState(0);
  const [startMinutes, setStartMinutes] = useState(0);
  const [endDays, setEndDays] = useState(0);
  const [endHours, setEndHours] = useState(0);
  const [endMinutes, setEndMinutes] = useState(0);

  const setAuctionTime = (type: "start" | "end", unit: string, value: number) => {
    const val = Math.min(unit === "days" ? 3 : 23, value);
    if (type === "start") {
      if (unit === "days") setStartDays(val);
      if (unit === "hours") setStartHours(val);
      if (unit === "minutes") setStartMinutes(Math.min(59, value));
    } else {
      if (unit === "days") setEndDays(val);
      if (unit === "hours") setEndHours(val);
      if (unit === "minutes") setEndMinutes(Math.min(59, value));
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        startDays,
        startHours,
        startMinutes,
        endDays,
        endHours,
        endMinutes,
        setAuctionTime,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within an AuctionProvider");
  }
  return context;
};
