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
            isMobile ? "w-full justify-start space-x-2" : "space-x-2"
          } mt-0 sm:mt-0`}
        >
          <div className="relative flex-grow max-w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Browse now"
              className={cn("pl-4 pr-10 py-2 border rounded-full w-full", isMobile ? "text-[10px]" : "text-xs"
              )}
            />
            <Search className="absolute right-3 top-2.5 w-3 h-3 text-gray-400" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn("flex items-center rounded-full whitespace-nowrap", isMobile ? "text-[10px]" : "text-xs"
             )}
             >
            <i className={cn("bx bx-sort-alt-2 -mr-1", isMobile ? "text-xs" : "text-sm")}></i>
            Sort
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Components;
