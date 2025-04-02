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
        "p-1 rounded-full transition-colors text-gray-500 hover:text-black", 
        className
      )}
      aria-label="Tip jar"
    >
      <i className='bx bx-box' style={{ fontSize: '18px' }}></i>
    </button>
  );
};

export default TipJarIcon;
