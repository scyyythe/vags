import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

type TransactionType = "all" | "donation" | "purchase" | "auction_claim" | "bid" | "commission";
type TransactionStatus = "all" | "completed" | "pending" | "failed";

interface TransactionLogsFilterProps {
  filter: {
    type: TransactionType;
    status: TransactionStatus;
  };
  onChange: (filter: { type: TransactionType; status: TransactionStatus }) => void;
  onSearch: (query: string) => void;
}

export function TransactionLogsFilter({ filter, onChange, onSearch }: TransactionLogsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-4 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <Input
          placeholder="Search transactions..."
          className="pl-8 rounded-full h-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={{fontSize:"10px"}}
        />
      </div>

      <Select
        value={filter.type}
        onValueChange={(value: TransactionType) =>
          onChange({ ...filter, type: value })
        }
      >
        <SelectTrigger className="w-[140px] text-[10px] rounded-full h-8">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[10px]">All Types</SelectItem>
          <SelectItem value="donation" className="text-[10px]">Donation</SelectItem>
          <SelectItem value="purchase" className="text-[10px]">Purchase</SelectItem>
          <SelectItem value="auction_claim" className="text-[10px]">Auction Claim</SelectItem>
          <SelectItem value="bid" className="text-[10px]">Bid Placed</SelectItem>
          <SelectItem value="commission" className="text-[10px]">Commission</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filter.status}
        onValueChange={(value: TransactionStatus) =>
          onChange({ ...filter, status: value })
        }
      >
        <SelectTrigger className="w-[140px] text-[10px] rounded-full h-8">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[10px]">All Status</SelectItem>
          <SelectItem value="completed" className="text-[10px]">Completed</SelectItem>
          <SelectItem value="pending" className="text-[10px]">Pending</SelectItem>
          <SelectItem value="failed" className="text-[10px]">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* <Button 
        variant="outline" 
        size="sm" 
        className="text-[10px] h-8"
        onClick={handleSearch}
      >
        <Search className="h-3 w-3 mr-1" />
        Search
      </Button> */}
    </div>
  );
}
