import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface AuctionDurationPickerProps {
  days: number;
  hours: number;
  minutes: number;
  onDaysChange: (days: number) => void;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  maxDays?: number;
}

const AuctionDurationPicker = ({
  days,
  hours,
  minutes,
  onDaysChange,
  onHoursChange,
  onMinutesChange,
  maxDays = 30,
}: AuctionDurationPickerProps) => {
  const [daysValue, setDaysValue] = useState(days.toString());
  const [hoursValue, setHoursValue] = useState(hours.toString());
  const [minutesValue, setMinutesValue] = useState(minutes.toString());

  useEffect(() => {
    setDaysValue(days.toString());
    setHoursValue(hours.toString());
    setMinutesValue(minutes.toString());
  }, [days, hours, minutes]);

  const handleDaysChange = (value: string) => {
    setDaysValue(value);
    const numValue = value === "" ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      const validDays = Math.min(Math.max(0, numValue), maxDays);
      onDaysChange(validDays);
    }
  };

  const handleHoursChange = (value: string) => {
    setHoursValue(value);
    const numValue = value === "" ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      const validHours = Math.min(Math.max(0, numValue), 23);
      onHoursChange(validHours);
    }
  };

  const handleMinutesChange = (value: string) => {
    setMinutesValue(value);
    const numValue = value === "" ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      const validMinutes = Math.min(Math.max(0, numValue), 59);
      onMinutesChange(validMinutes);
    }
  };

  return (
    <div className="flex items-center text-[10px]">
      <div className="flex flex-col items-center">
        <Input
          type="number"
          value={daysValue}
          onChange={(e) => handleDaysChange(e.target.value)}
          className="w-12 text-center p-2"
          style={{ fontSize: '10px' }}
          min={0}
          max={maxDays}
        />
        <span className="text-[10px] mt-1">Days</span>
      </div>

      <span className="mx-2 text-xl">:</span>

      <div className="flex flex-col items-center">
        <Input
          type="number"
          value={hoursValue}
          onChange={(e) => handleHoursChange(e.target.value)}
          className="w-12 text-center p-2 "
          style={{ fontSize: '10px' }}
          min={0}
          max={23}
        />
        <span className="text-[9px] mt-1">Hrs</span>
      </div>

      <span className="mx-2 text-xl">:</span>

      <div className="flex flex-col items-center">
        <Input
          type="number"
          value={minutesValue}
          onChange={(e) => handleMinutesChange(e.target.value)}
          className="w-12 text-center p-2"
          style={{ fontSize: '10px' }}
          min={0}
          max={59}
        />
        <span className="text-[9px] mt-1">Mins</span>
      </div>
    </div>
  );
};

export default AuctionDurationPicker;
