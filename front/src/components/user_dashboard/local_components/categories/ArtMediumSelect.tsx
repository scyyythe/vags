import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { mediumOptions } from "@/components/user_dashboard/user_profile/components/options/MediumOptions";

type Props = {
  selectedMedium: string;
  onChange: (value: string) => void;
};

const ArtMediumSelect = ({ selectedMedium, onChange }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Select value={selectedMedium} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "bg-transparent h-[26px] w-35 px-3 focus:ring-0 focus:ring-offset-0 rounded-full border border-gray-300",
          isMobile ? "text-[10px]" : "text-[10px]"
        )}
      >
        <SelectValue placeholder="Select Medium" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Medium" className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
          Medium
        </SelectItem>
        {mediumOptions.map((medium) => (
          <SelectItem key={medium} value={medium} className={cn(isMobile ? "text-[10px]" : "text-[10px]")}>
            {medium}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ArtMediumSelect;
