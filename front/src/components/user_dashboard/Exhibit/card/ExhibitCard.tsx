import { useState } from 'react';
import { toast } from "sonner";
import { Eye, Heart, MoreHorizontal } from 'lucide-react';
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
  const { mutate: submitReport } = useSubmitReport();
  const { data: reportStatusData, isLoading: reportLoading, error: reportError } = useReportStatus([exhibit.id]);

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
    // submitReport(exhibit.id);
    setMenuOpen(false);
  };

  const handleHide = () => {
      setIsHidden(true);
      toast("Artwork hidden");
      setMenuOpen(false);
    };

  const collaborators = exhibit.collaborators || [
    { id: '1', name: 'User 1', avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '2', name: 'User 2', avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '3', name: 'User 3', avatar: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="w-full rounded-xl bg-white border hover:shadow-lg transition-all duration-300 cursor-pointer relative" onClick={onClick}>
      <div className="relative">
        <img 
          src={exhibit.image} 
          alt={exhibit.title} 
          className="w-full h-40 object-cover rounded-lg"
        />
        <div className="absolute top-3 right-3 bg-white rounded-sm px-2 pb-0.5">
          <span className="text-[10px] font-medium">{exhibit.category}</span>
        </div>

        {!exhibit.isSolo && (
          <div className="absolute top-3 left-3 flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator, index) => (
              <Avatar 
                key={collaborator.id} 
                className={`border border-white h-5 w-5 ${index === 2 ? 'bg-red-500 text-white text-[10px]' : ''}`}
              >
                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2">   
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <Eye size={11} className="text-gray-700 mr-1" />
            <span className="text-[9px] font-medium">{formatNumber(exhibit.views)}</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <Heart size={10} className="text-gray-700 mr-1" />
            <span className="text-[9px] font-medium">{exhibit.likes}</span>
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

            {/* Exhibit Menu inserted here */}
            <ExhibitMenu
              isOpen={menuOpen}
              onHide={handleHide}
              onReport={handleReport}
              // isReported={!!reportStatusData?.reported}
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
