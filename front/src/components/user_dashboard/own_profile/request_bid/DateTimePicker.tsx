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
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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

  // Language and translation
  const { language } = useLanguage();
  const pickDateText = useAutoTranslation("Pick a date", language);
  const hrsText = useAutoTranslation("Hrs", language);
  const minsText = useAutoTranslation("Mins", language);

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
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal text-[10px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{pickDateText}</span>}
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
              className="p-3"
              showOutsideDays={false}
              fixedWeeks={false}
              classNames={{
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-xs font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-xs"
                ),
              }}
            />
            
          </PopoverContent>
        </Popover>

        <span className="text-xl">:</span>

        <div className="flex items-center text-[10px]">
          <div className="flex flex-col items-center relative top-[9px]">
            <Input
              type="number"
              value={hoursValue}
              onChange={(e) => handleHoursChange(e.target.value)}
              className="w-12 text-center p-2 text-[9px] leading-tight"
              style={{ fontSize: '10px' }}
              min={0}
              max={23}
            />
            <span className="text-[9px] mt-1 text-gray-900 dark:text-gray-100">{hrsText}</span>
          </div>

          <span className="mx-2 text-xl">:</span>

          <div className="flex flex-col items-center relative top-[9px]">
            <Input
              type="number"
              value={minutesValue}
              onChange={(e) => handleMinutesChange(e.target.value)}
              className="w-12 text-center p-2 text-[9px] leading-tight"
              style={{ fontSize: '10px' }}
              min={0}
              max={59}
            />
            <span className="text-[9px] mt-1 text-gray-900 dark:text-gray-100">{minsText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;
