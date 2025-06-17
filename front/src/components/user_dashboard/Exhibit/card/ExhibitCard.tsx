import { useState } from 'react';
import { toast } from "sonner";
import { Eye, Heart, MoreHorizontal, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ExhibitMenu from "@/components/user_dashboard/Exhibit/menu/ExhibitMenu";
import useSubmitReport from "@/hooks/mutate/report/useSubmitReport";
import useReportStatus from "@/hooks/mutate/report/useReportStatus";

interface ExhibitProps {
  exhibit: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    likes: number;
    views: number;
    isSolo: boolean;
    isShared: boolean;
    startDate?: string;
    endDate?: string;
    collaborators?: {
      id: string;
      name: string;
      avatar?: string;
    }[];
  };
  onClick?: () => void;
}

const ExhibitCard: React.FC<ExhibitProps> = ({ exhibit, onClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { mutate: submitReport } = useSubmitReport();
  const { data: reportStatusData } = useReportStatus([exhibit.id]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  };

  const handleReport = () => {
    if (reportStatusData?.reported) {
      toast.error("You have already reported this artwork.");
      setMenuOpen(false);
      return;
    }
    setMenuOpen(false);
  };

  const handleHide = () => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const collaborators = exhibit.collaborators || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  };

  const isNotStartedYet = () => {
    const now = new Date();
    const start = exhibit.startDate ? new Date(exhibit.startDate) : null;
    return start && now < start;
  };

  const getDurationLabel = () => {
    const now = new Date();
    const start = exhibit.startDate ? new Date(exhibit.startDate) : null;
    const end = exhibit.endDate ? new Date(exhibit.endDate) : null;

    if (start && now < start) {
      const startFormatted = start.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
      const endFormatted = end?.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
      return `${startFormatted} - ${endFormatted}`;
    }

    if (end && now > end) {
      return "Ended";
    }

    if (start && end && now >= start && now <= end) {
      const timeDiff = end.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      if (daysLeft <= 5) return `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
      return "Ongoing";
    }

    return "Ongoing";
  };

  return (
    <div
      className={`relative w-full rounded-xl bg-white border transition-all duration-300 ${
        isNotStartedYet()
          ? 'cursor-not-allowed opacity-70'
          : 'cursor-pointer hover:shadow-lg'
      }`}
      onClick={() => {
        if (!isNotStartedYet() && onClick) {
          onClick();
        }
      }}
      onMouseEnter={() => {
        if (isNotStartedYet()) setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip with animation */}
      {showTooltip && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap
          transition-all duration-200 ease-out opacity-100 translate-y-0"
        >
          Exhibit not available yet
        </div>
      )}

      <div className="relative">
        <img
          src={exhibit.image}
          alt={exhibit.title}
          className="w-full h-40 object-cover rounded-lg"
        />

        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 pb-0.5">
          <span className="text-[10px] font-medium">{exhibit.category}</span>
        </div>

        {!exhibit.isSolo && (
          <div className="absolute top-3 left-3 flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator) => (
              <Avatar
                key={collaborator.id}
                className="border border-white h-5 w-5"
              >
                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}

        {/* Duration / Status label */}
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
          <Calendar size={8} className="text-gray-700" />
          <span className="text-[9px] font-semibold text-red-600">
            {getDurationLabel()}
          </span>
        </div>

        {/* Views and Likes */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <Eye size={11} className="text-gray-700 mr-1" />
            <span className="text-[9px] font-medium">{formatNumber(exhibit.views)}</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <Heart size={10} className="text-gray-700 mr-1" />
            <span className="text-[9px] font-medium">{formatNumber(exhibit.likes)}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 rounded-b-lg">
        <div className="flex justify-between items-start relative">
          <h2 className="font-semibold text-xs">"{exhibit.title}"</h2>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreHorizontal size={13} className="text-gray-500" />
            </button>

            <ExhibitMenu
              isOpen={menuOpen}
              onHide={handleHide}
              onReport={handleReport}
              isShared={exhibit.isShared}
              isHidden={isHidden}
            />
          </div>
        </div>

        <p className="text-[9px] text-gray-600 line-clamp-2">{exhibit.description}</p>
      </div>
    </div>
  );
};

export default ExhibitCard;
