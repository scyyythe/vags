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
  label?: string;
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
  label = "Select date and time"
}: DateTimePickerProps) => {
  const [hoursValue, setHoursValue] = useState(hours.toString());
  const [minutesValue, setMinutesValue] = useState(minutes.toString());

  // Update local values when props change
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
    <div className="flex flex-col space-y-2">
      <p className="text-sm mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <Input
              type="number"
              value={hoursValue}
              onChange={(e) => handleHoursChange(e.target.value)}
              className="w-12 text-center p-2"
              min={0}
              max={23}
            />
            <span className="text-xs mt-1">Hrs</span>
          </div>
          
          <span className="mx-2 text-xl">:</span>
          
          <div className="flex flex-col items-center">
            <Input
              type="number"
              value={minutesValue}
              onChange={(e) => handleMinutesChange(e.target.value)}
              className="w-12 text-center p-2"
              min={0}
              max={59}
            />
            <span className="text-xs mt-1">Mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;