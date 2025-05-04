import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import { useIsMobile } from "@/hooks/use-mobile";

const Components = () => {
  const isMobile = useIsMobile();

  return (
    <section className="mb-10">
      <div
        className={`mb-6 ${
          isMobile
            ? "flex flex-row items-start gap-2" 
            : "flex justify-between items-center"
        }`}
      >
        {/* Left Section */}
        <div
          className={`flex items-center ${
            isMobile ? "w-full justify-start gap-4" : "gap-6"
          }`}
        >
          <h2 className={cn("font-bold",
              isMobile ? "text-sm" : "text-lg"
            )} >Feed</h2>
          <div className="flex space-x-2 w-full max-w-xs">
            <ArtCategorySelect />
          </div>
        </div>

        {/* Right Section */}
        <div
          className={`flex items-center ${
            isMobile ? "w-full justify-start space-x-2" : "space-x-4"
          } mt-0 sm:mt-0`}
        >
          <div className="relative w-full sm:w-sm md:w-xl">
            <input
              type="text"
              placeholder="Browse now"
              className={cn("pl-4 pr-10 py-[6px] border border-gray-400 rounded-full w-full", isMobile ? "text-[10px]" : "text-[11px]"
              )}
            />
            <Search className="absolute right-3 top-2.5 w-[10px] h-[10px] text-gray-400" />
          </div>
          <button
            className={cn("flex items-center px-3 py-[6px] gap-2 border border-gray-400 rounded-full whitespace-nowrap", isMobile ? "text-[10px]" : "text-[11px]"
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
