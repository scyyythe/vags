import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ART_CATEGORIES } from "@/components/user_dashboard/local_components/categories/ArtCategories";

type Props = {
  selectedCategory: string;
  onChange: (value: string) => void;
};
const ArtCategorySelect = ({ selectedCategory, onChange }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Select value={selectedCategory} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "bg-transparent h-[28px] w-35 px-3 focus:ring-0 focus:ring-offset-0 rounded-full border border-gray-300",
          isMobile ? "text-[10px]" : "text-[10px]"
        )}
      >
        <img src="/pics/b_logo.png" className="w-3 h-3 mr-2" />
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All" className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
          All
        </SelectItem>
        {ART_CATEGORIES.map((category) => (
          <SelectItem key={category} value={category} className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ArtCategorySelect;