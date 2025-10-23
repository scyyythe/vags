import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useArtCategories } from "@/components/user_dashboard/local_components/categories/ArtCategories";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type Props = {
  selectedCategory: string;
  onChange: (value: string) => void;
};
const ArtCategorySelect = ({ selectedCategory, onChange }: Props) => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const translatedCategories = useArtCategories();

  // Pre-translate all strings to avoid calling hooks inside loops
  const selectCategoryText = useAutoTranslation("Select Category", language);
  const allText = useAutoTranslation("All", language);

  // Handle value change to ensure "All" is properly handled
  const handleValueChange = (value: string) => {
    // If the selected value is the translated "All" text, pass "All" to parent
    if (value === allText) {
      onChange("All");
    } else {
      onChange(value);
    }
  };

  // Determine the display value - if selectedCategory is "All", show translated "All"
  const displayValue = selectedCategory === "All" ? allText : selectedCategory;

  return (
    <Select value={displayValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "bg-transparent h-[26px] w-35 px-3 focus:ring-0 focus:ring-offset-0 rounded-full border border-gray-300",
          isMobile ? "text-[10px]" : "text-[10px]"
        )}
      >
        <img src="/pics/2.png" className="w-4 h-4 mr-1 dark:hidden" />
        <img src="/pics/1.png" className="w-4 h-4 mr-1 hidden dark:block" />
        <SelectValue placeholder={selectCategoryText} />
      </SelectTrigger>
      <SelectContent style={{ maxHeight: "50vh" }} className="relative right-14">
        <SelectItem value={allText} className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
          {allText}
        </SelectItem>
        {translatedCategories.map((category, index) => (
          <SelectItem key={`category-${index}`} value={category} className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ArtCategorySelect;