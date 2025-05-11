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
        "p-1 rounded-full transition-colors", 
        className
      )}
      aria-label="Tip jar"
    >
      <i className='bx bx-box mt-1' style={{ fontSize: '15px' }}></i>
    </button> 
  );
};

export default TipJarIcon;
