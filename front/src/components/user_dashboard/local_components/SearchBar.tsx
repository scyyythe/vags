import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = ({ onSearchChange }) => {
  return (
    <div className="flex items-center w-full">
      <Search size={11} className="text-muted-foreground mr-2 shrink-0" />
      <Input
        type="text"
        placeholder="Search"
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0 w-full text-[10px]"
        style={{ fontSize: "12px", height: "35px" }}
        onChange={(e) => onSearchChange(e.target.value)} // Update search query
      />
    </div>
  );
};
export default SearchBar;
