import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoggedInUserId } from "@/auth/decode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowUser } from "@/hooks/follow/useFollowUser";
import { useUnfollowUser } from "@/hooks/follow/useUnfollowUser";
import useFollowStatus from "@/hooks/follow/useFollowStatus";
import useFollowCounts from "@/hooks/follow/useFollowCount";
import EditProfile from "../../own_profile/edit_profile/EditButton";
interface ProfileHeaderProps {
  bannerImage: string;
  profileImage: string;
  name: string;
  items: number;
  profileUserId: string;
  onBannerChange?: (file: File) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  bannerImage,
  profileImage,
  name,
  items,
  profileUserId,
  onBannerChange,
}) => {
  const [localBanner, setLocalBanner] = useState<string>(bannerImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const loggedInUserId = getLoggedInUserId();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { id } = useParams<{ id: string }>();
  const { data: followCounts, error } = useFollowCounts(id || "");

  if (error) {
    console.error("Error fetching follow counts:", error.message);
  }

  const { data, isLoading: isFollowStatusLoading } = useFollowStatus({
    profileUserId,
  });
  useEffect(() => {
    if (data !== undefined) {
      setIsFollowing(data as boolean);
    }
  }, [data]);
  const toggleFollow = async () => {
    if (!isFollowing) {
      followMutation.mutate(
        { following: profileUserId },
        {
          onSuccess: () => {
            setIsFollowing(true);
          },
          onError: (error) => {
            console.error("Follow error:", error);
          },
        }
      );
    } else {
      unfollowMutation.mutate(
        { following: profileUserId },
        {
          onSuccess: () => {
            setIsFollowing(false);
          },
          onError: (error) => {
            console.error("Unfollow error:", error);
          },
        }
      );
    }
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
  if (isFollowStatusLoading) {
    return (
      <button disabled className="px-8 py-[6px] rounded-full text-[10px] bg-gray-500 text-white">
        Loading...
      </button>
    );
  }
  return (
    <div className="w-full px-4">
      {/* Banner */}
      <div
        className="relative w-full h-52 md:h-72 rounded-lg overflow-hidden bg-blue-100 cursor-pointer"
        onClick={triggerFileInput}
        title="Click to change banner image"
      >
        <img src={localBanner} alt="Profile Banner" className="w-full h-full object-cover" />
        {/* Optional overlay icon */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white rounded-full p-1">
          <i className="bx bx-camera"></i>
        </div>
        {/* Hidden file input */}
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleBannerChange} />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-14 md:-mt-14">
        {/* Profile Image */}
        <Avatar className="w-28 h-28 border-4 border-white z-20">
          {profileImage ? <AvatarImage src={profileImage} alt={name} /> : null}
          <AvatarFallback className="text-2xl font-bold bg-gray-200 text-gray-600">{name.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Name */}
        <h1 className="text-xl md:text-xl font-bold mt-4">{name}</h1>

        {/* Stats */}
        <div className="flex items-center space-x-4 mt-2 text-xs md:text-xs">
          <span>
            <strong>{followCounts?.followers ?? 0}</strong> followers
          </span>
          <span>•</span>
          <span>
            <strong>{followCounts?.following ?? 0}</strong> following
          </span>
          <span>•</span>
          <span>
            <strong>{items}</strong> items
          </span>
        </div>

        {loggedInUserId !== profileUserId ? (
          <div className="flex items-center space-x-2 mt-4 relative">
            <button
              onClick={toggleFollow}
              disabled={isLoading}
              className={`px-8 py-[6px] rounded-full text-[10px] ${
                isLoading
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : isFollowing
                  ? "bg-white text-black border border-gray-300 hover:bg-gray-100"
                  : "bg-red-800 text-white hover:bg-red-700"
              }`}
            >
              {isLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
            </button>

            <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-8 h-8">
              <i className="bx bx-envelope text-xs"></i>
            </Button>

            <DropdownMenu open={optionsOpen} onOpenChange={setOptionsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-8 h-8">
                  <i className="bx bx-dots-horizontal-rounded text-sm"></i>
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
        ) : (
          <EditProfile />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
