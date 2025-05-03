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
    <div className="w-full">
      {/* Banner */}
      <div className="w-full h-48 md:h-56 rounded-lg overflow-hidden bg-blue-100">
        <img 
          src={bannerImage} 
          alt="Profile Banner" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-16 md:-mt-20">
        {/* Profile Image */}
        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
          <img 
            src={profileImage} 
            alt={name} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Name */}
        <h1 className="text-2xl md:text-3xl font-bold mt-4">{name}</h1>

        {/* Stats */}
        <div className="flex items-center space-x-4 mt-2 text-sm md:text-base">
          <span><strong>{followers}</strong> followers</span>
          <span><strong>{following}</strong> following</span>
          <span><strong>{items}</strong> items</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4">
          <Button 
            onClick={toggleFollow} 
            className={`px-6 rounded-full ${
              isFollowing 
                ? 'bg-white text-black border border-gray-300 hover:bg-gray-100' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          
          <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-9 h-9">
            <MessageSquare className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-9 h-9">
            <Share2 className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-9 h-9">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white p-2 shadow-lg rounded-md min-w-[120px] animate-fade-in">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
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
