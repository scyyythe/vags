import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="flex items-center w-full">
      <Search size={18} className="text-muted-foreground mr-2" />
      <Input
        type="text"
        placeholder="Search"
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0 text-sm"
      />
    </div>
  );
};

export default SearchBar;