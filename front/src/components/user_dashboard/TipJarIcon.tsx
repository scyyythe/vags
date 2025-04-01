import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface TipJarIconProps {
  onClick: () => void;
  className?: string;
}

const TipJarIcon = ({ onClick, className }: TipJarIconProps) => {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "p-1 rounded-full transition-colors text-gray-400 hover:text-purple-500", 
        className
      )}
      aria-label="Tip jar"
    >
      <DollarSign size={18} />
    </button>
  );
};

export default TipJarIcon;
