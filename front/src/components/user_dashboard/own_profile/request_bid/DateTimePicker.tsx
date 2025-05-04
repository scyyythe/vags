import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date: Date | undefined;
  hours: number;
  minutes: number;
  onDateChange: (date: Date | undefined) => void;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DateTimePicker = ({
  date,
  hours,
  minutes,
  onDateChange,
  onHoursChange,
  onMinutesChange,
  minDate,
  maxDate,
}: DateTimePickerProps) => {
  const [hoursValue, setHoursValue] = useState(hours.toString());
  const [minutesValue, setMinutesValue] = useState(minutes.toString());

  useEffect(() => {
    setHoursValue(hours.toString());
    setMinutesValue(minutes.toString());
  }, [hours, minutes]);

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
    <div className="flex flex-col space-y-2 text-[10px]">
      <div className="flex items-end gap-2 text-[10px]">
  {/* Calendar Picker */}
  <div className="flex flex-col items-start">
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[180px] justify-start text-left font-normal text-[10px] h-[42px]",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 text-[10px]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto text-[10px]")}
        />
      </PopoverContent>
    </Popover>
  </div>

  {/* Time Pickers */}
  <div className="flex items-end gap-2">
    {/* Hours */}
    <div className="flex flex-col items-center">
      <Input
        type="number"
        value={hoursValue}
        onChange={(e) => handleHoursChange(e.target.value)}
        className="w-12 text-center p-1 text-[10px] leading-tight h-[30px]"
        min={0}
        max={23}
      />
      <span className="text-[10px] mt-1">Hrs</span>
    </div>

    <span className="text-[10px] pb-3">:</span>

    {/* Minutes */}
    <div className="flex flex-col items-center">
      <Input
        type="number"
        value={minutesValue}
        onChange={(e) => handleMinutesChange(e.target.value)}
        className="w-12 text-center p-1 text-[10px] leading-tight h-[30px]"
        min={0}
        max={59}
      />
      <span className="text-[10px] mt-1">Mins</span>
    </div>
  </div>
</div>

    </div>
  );
};

export default DateTimePicker;
