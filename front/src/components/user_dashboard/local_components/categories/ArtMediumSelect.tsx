import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediumOptions } from "@/components/user_dashboard/user_profile/components/options/MediumOptions";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type Props = {
  selectedMedium: string;
  onChange: (value: string) => void;
};

const ArtMediumSelect = ({ selectedMedium, onChange }: Props) => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const translatedMediums = useMediumOptions();

  // Pre-translate all strings to avoid calling hooks inside loops
  const selectMediumText = useAutoTranslation("Select Medium", language);
  const mediumText = useAutoTranslation("Medium", language);

  return (
    <Select value={selectedMedium} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "bg-transparent h-[26px] w-35 px-3 focus:ring-0 focus:ring-offset-0 rounded-full border border-gray-300",
          isMobile ? "text-[10px]" : "text-[10px]"
        )}
      >
        <SelectValue placeholder={selectMediumText} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Medium" className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
          {mediumText}
        </SelectItem>
        {translatedMediums.map((medium) => (
          <SelectItem key={medium} value={medium} className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
            {medium}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ArtMediumSelect;
