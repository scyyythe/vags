import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { cn } from "@/lib/utils";
  import { useIsMobile } from "@/hooks/use-mobile";
  import { ART_CATEGORIES } from "@/components/user_dashboard/local_components/categories/ArtCategories";
  
  const ArtCategorySelect = () => {
    const isMobile = useIsMobile();
    
    return (
      <Select defaultValue="Digital Art">
        <SelectTrigger className={cn("bg-transparent h-8 w-35 px-3 focus:ring-0 focus:ring-offset-0 rounded-sm border border-gray-300", isMobile ? "text-[10px]" : "text-[11px]")}>
          <img src="/pics/b_logo.png" className="w-3 h-3 mr-2" />
          <SelectValue placeholder="Digital Art" />
        </SelectTrigger>
        <SelectContent>
          {ART_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category} className={cn(isMobile ? "text-[10px]" : "text-[11px]")}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };
  
  export default ArtCategorySelect;
  