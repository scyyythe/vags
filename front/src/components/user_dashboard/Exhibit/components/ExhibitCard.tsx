import { useState } from 'react';
import { Eye, Heart, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    collaborators?: {
      id: string;
      name: string;
      avatar?: string;
    }[];
  };
}

const ExhibitCard: React.FC<ExhibitProps> = ({ exhibit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const formatNumber = (num: number) => {
    return num >= 1 ? `${num}k` : `${Math.round(num * 1000)}`;
  };

  // Generate placeholder collaborators if none provided
  const collaborators = exhibit.collaborators || [
    { id: '1', name: 'User 1', avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '2', name: 'User 2', avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '3', name: 'User 3', avatar: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white border hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img 
          src={exhibit.image} 
          alt={exhibit.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-80 rounded-md px-2 py-1">
          <span className="text-xs font-medium">{exhibit.category}</span>
        </div>
        
        {!exhibit.isSolo && (
          <div className="absolute top-3 left-3 flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator, index) => (
              <Avatar 
                key={collaborator.id} 
                className={`border-2 border-white h-7 w-7 ${index === 2 ? 'bg-red-500 text-white text-[10px]' : ''}`}
              >
                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="flex items-center bg-white bg-opacity-80 rounded-full px-2 py-1">
            <Heart size={14} className="text-gray-700 mr-1" />
            <span className="text-xs">{exhibit.likes}</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-80 rounded-full px-2 py-1">
            <Eye size={14} className="text-gray-700 mr-1" />
            <span className="text-xs">{formatNumber(exhibit.views)}</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-semibold text-lg">{exhibit.title}</h2>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md py-1 w-32 z-10">
                <button 
                  className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                >
                  Save
                </button>
                <button 
                  className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                >
                  Share
                </button>
                <button 
                  className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{exhibit.description}</p>
      </div>
    </div>
  );
};

export default ExhibitCard;
