import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = ({ onSearchChange }) => {
  return (
    <div className="flex items-center w-full">
      <Input
        type="text"
        placeholder="Browse now"
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0 w-full text-[10px]"
        style={{ fontSize: "10px", height: "30px" }}
        onChange={(e) => onSearchChange(e.target.value)} // Update search query
      />
      <Search size={11} className="relative right-auto top-6.5 w-3 h-3 text-gray-500" />
    </div>
  );
};
export default SearchBar;
