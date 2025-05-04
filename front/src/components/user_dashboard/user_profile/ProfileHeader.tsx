import React, { useState } from 'react';
import { MoreHorizontal, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ProfileHeaderProps {
  bannerImage: string;
  profileImage: string;
  name: string;
  followers: number;
  following: number;
  items: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  bannerImage,
  profileImage,
  name,
  followers,
  following,
  items
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="w-full px-8">
      {/* Banner */}
      <div className="w-full h-52 md:h-72 rounded-lg overflow-hidden bg-blue-100">
        <img 
          src={bannerImage} 
          alt="Profile Banner" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-14 md:-mt-14">
        {/* Profile Image */}
        <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden">
          <img 
            src={profileImage} 
            alt={name} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Name */}
        <h1 className="text-xl md:text-xl font-bold mt-4">{name}</h1>

        {/* Stats */}
        <div className="flex items-center space-x-4 mt-2 text-xs md:text-xs">
          <span><strong>{followers}</strong> followers</span>
          <span><strong>{following}</strong> following</span>
          <span><strong>{items}</strong> items</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4">
          <button 
            onClick={toggleFollow} 
            className={`px-8 py-[6px] rounded-full text-[11px] ${
              isFollowing 
                ? 'bg-white text-black border border-gray-300 hover:bg-gray-100' 
                : 'bg-red-800 text-white hover:bg-red-700'
            }`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
          
          <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-8 h-8">
            <i className='bx bx-envelope text-xs'></i>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-8 h-8">
                <i className='bx bx-dots-horizontal-rounded text-sm' ></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white p-2 shadow-lg rounded-md min-w-[120px] animate-fade-in">
              <DropdownMenuItem className="cursor-pointer text-xs hover:bg-gray-100 rounded px-2 py-1">
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-xs hover:bg-gray-100 rounded px-2 py-1">
                Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
