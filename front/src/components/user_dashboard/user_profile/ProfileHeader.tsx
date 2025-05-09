import React, { useState, useRef  } from 'react';
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
  onBannerChange?: (file: File) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  bannerImage,
  profileImage,
  name,
  followers,
  following,
  items,
  onBannerChange
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [localBanner, setLocalBanner] = useState<string>(bannerImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  // Handle file selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the selected image locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalBanner(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Pass the file to parent or upload handler if provided
      if (onBannerChange) {
        onBannerChange(file);
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="w-full px-4">
      {/* Banner */}
      <div className="relative w-full h-52 md:h-72 rounded-lg overflow-hidden bg-blue-100 cursor-pointer" onClick={triggerFileInput} title="Click to change banner image">
        <img 
          src={localBanner} 
          alt="Profile Banner" 
          className="w-full h-full object-cover" 
        />
        {/* Optional overlay icon */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white rounded-full p-1">
          <i className='bx bx-camera'></i>
        </div>
        {/* Hidden file input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleBannerChange} 
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-14 md:-mt-14">
        {/* Profile Image */}
        <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden z-20">
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
          <span>•</span>
          <span><strong>{following}</strong> following</span>
          <span>•</span>
          <span><strong>{items}</strong> items</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4 relative">
          <button 
            onClick={toggleFollow} 
            className={`px-8 py-[6px] rounded-full text-[10px] ${
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
          
          <DropdownMenu open={optionsOpen} onOpenChange={setOptionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-8 h-8">
                <i className='bx bx-dots-horizontal-rounded text-sm' ></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={4}
              className="z-50 bg-white p-2 shadow-lg rounded-md min-w-[120px] animate-fade-in"
              forceMount
            >
              <DropdownMenuItem className="cursor-pointer text-[10px] hover:bg-gray-100 rounded px-2 py-1">
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-[10px] hover:bg-gray-100 rounded px-2 py-1">
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
