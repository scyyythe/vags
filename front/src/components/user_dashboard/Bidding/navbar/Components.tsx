import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import { useIsMobile } from "@/hooks/use-mobile";

const Components = () => {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  return (
    <section className="w-[105%] relative -left-7">
      <div className={`mb-6 ${isMobile ? "flex flex-row items-start gap-2" : "flex justify-between items-center"}`}>
        {/* Left Section */}
        <div className={`flex items-center ${isMobile ? "w-full justify-start gap-4" : "gap-6"}`}>
          <h2 className={cn("font-bold text-gray-900 dark:text-gray-100", isMobile ? "text-sm" : "text-lg")}>Feed</h2>
          <div className="flex space-x-2 w-full max-w-xs">
            <ArtCategorySelect selectedCategory={selectedCategory} onChange={(value) => setSelectedCategory(value)} />
          </div>
        </div>

        {/* Right Section */}
        <div className={`flex items-center ${isMobile ? "w-full justify-start space-x-2" : "space-x-4"} mt-0 sm:mt-0`}>
          <div className="relative w-full sm:w-sm md:w-xl">
            <input
              type="text"
              placeholder="Browse now"
              className={cn(
                "pl-4 pr-10 py-[6px] border border-gray-400 dark:border-gray-600 rounded-full w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400",
                isMobile ? "text-[10px]" : "text-[11px]"
              )}
            />
            <Search className="absolute right-3 top-2.5 w-[10px] h-[10px] text-gray-400 dark:text-gray-500" />
          </div>
          <button
            className={cn(
              "flex items-center px-3 py-[6px] gap-2 border border-gray-400 dark:border-gray-600 rounded-full whitespace-nowrap bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
              isMobile ? "text-[10px]" : "text-[11px]"
            )}
          >
            <i className={cn("bx bx-sort-alt-2 -mr-1", isMobile ? "text-[10px]" : "text-[11px]")}></i>
            Sort
          </button>
        </div>
      </div>
    </section>
  );
};

export default Components;
