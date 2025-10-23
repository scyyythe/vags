import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useSearchParams } from "react-router-dom";

const SearchBar = ({ onSearchChange }: { onSearchChange: (value: string) => void }) => {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState("");
  const { language } = useLanguage(); // Get current language

  // Sync with URL search params
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setValue(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(value);
    }, 300);

    return () => clearTimeout(handler);
  }, [value, onSearchChange]);

  return (
    <div className="flex items-center w-full">
      <Input
        type="text"
        autoComplete="off"
        placeholder={useAutoTranslation("Browse now", language)}
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0 w-full text-[10px]"
        style={{ fontSize: "10px", height: "30px" }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Search size={11} className="relative right-auto top-6.5 w-3 h-3 text-gray-500 dark:text-gray-400" />
    </div>
  );
};

export default SearchBar;
