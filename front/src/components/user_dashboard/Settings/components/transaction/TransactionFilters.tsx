import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./DateRangePicker";
import { format, subDays } from "date-fns";

interface TransactionFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  dateRangePreset: string;
  setDateRangePreset: (value: string) => void;
  receivedCount: number;
  sentCount: number;
  convertCount: number;
  filterType: string;
  setFilterType: (value: string) => void;
  onSearch: (value: string) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  dateRange,
  setDateRange,
  dateRangePreset,
  setDateRangePreset,
  receivedCount,
  sentCount,
  convertCount,
  filterType,
  setFilterType,
  onSearch
}) => {
  const handleDateRangePresetChange = (value: string) => {
    setDateRangePreset(value);
    
    const today = new Date();
    
    switch (value) {
      case "last7days":
        setDateRange({
          from: subDays(today, 7),
          to: today
        });
        break;
      case "last14days":
        setDateRange({
          from: subDays(today, 14),
          to: today
        });
        break;
      case "last30days":
        setDateRange({
          from: subDays(today, 30),
          to: today
        });
        break;
      case "custom":
        // Keep existing date range if any, otherwise initialize empty
        if (!dateRange) {
          setDateRange({
            from: undefined,
            to: undefined
          });
        }
        break;
      default:
        setDateRange(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dateRangePreset} onValueChange={handleDateRangePresetChange}>
            <SelectTrigger className="h-8 text-xs border-gray-300 px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last14days">Last 14 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRangePreset === "custom" ? (
            <DateRangePicker 
              dateRange={dateRange} 
              onDateRangeChange={(range) => {
                console.log("Date range changed:", range);
                setDateRange(range);
              }} 
            />
          ) : (
            dateRange && dateRange.from && dateRange.to && (
              <div className="text-xs px-3 py-1 border border-gray-300 rounded-md bg-gray-50">
                {format(dateRange.from, "d MMM")} - {format(dateRange.to, "d MMM")}
              </div>
            )
          )}
          
          <button className={cn(
            "text-xs px-3 py-1 rounded-md border", 
            filterType === "all" 
              ? "bg-gray-100 border-gray-300" 
              : "bg-white border-gray-300"
          )} onClick={() => setFilterType("all")}>
            All <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-[10px]">{receivedCount + sentCount + convertCount}</span>
          </button>
          
          <button className={cn(
            "text-xs px-3 py-1 rounded-md border", 
            filterType === "received" 
              ? "bg-gray-100 border-gray-300" 
              : "bg-white border-gray-300"
          )} onClick={() => setFilterType("received")}>
            Received <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-[10px]">{receivedCount}</span>
          </button>
          
          <button className={cn(
            "text-xs px-3 py-1 rounded-md border", 
            filterType === "sent" 
              ? "bg-gray-100 border-gray-300" 
              : "bg-white border-gray-300"
          )} onClick={() => setFilterType("sent")}>
            Sent <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-[10px]">{sentCount}</span>
          </button>
          
          <button className={cn(
            "text-xs px-3 py-1 rounded-md border", 
            filterType === "convert" 
              ? "bg-gray-100 border-gray-300" 
              : "bg-white border-gray-300"
          )} onClick={() => setFilterType("convert")}>
            Convert <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-[10px]">{convertCount}</span>
          </button>
        </div>
        
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="h-8 pl-8 pr-4 text-xs border border-gray-300 rounded-md"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Select defaultValue="currency">
            <SelectTrigger className="h-8 text-xs border-gray-300 px-3 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
              <SelectItem value="idr">IDR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
