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
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowUser } from "@/hooks/follow/useFollowUser";
import { useUnfollowUser } from "@/hooks/follow/useUnfollowUser";
import useFollowStatus from "@/hooks/follow/useFollowStatus";
import useFollowCounts from "@/hooks/follow/useFollowCount";
import EditProfile from "../../own_profile/edit_profile/EditButton";
import FollowModals from "@/components/user_dashboard/own_profile/following_&_followers/owners/profile/FollowModals";
import ProfileHeaderSkeleton from "@/components/skeletons/ProfileHeaderSkeleton";
import { useChat } from "@/context/ChatContext";
import { toast } from "sonner";
import { useSocials } from "@/hooks/users/social/useSocials";
interface ProfileHeaderProps {
  profileImage: string;
  name: string;
  items: number;
  profileUserId: string;
  cover: string;
  email?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileImage, name, items, profileUserId, cover, email }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const loggedInUserId = getLoggedInUserId();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { id } = useParams<{ id: string }>();
  const { data: followCounts, error } = useFollowCounts(id || "");
  const { data: socials = [], isLoading: isSocialsLoading, error: socialsError } = useSocials(profileUserId);
  const { openChat } = useChat();

  const [showReportOptions, setShowReportOptions] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);

  // Handle contact button click - open direct conversation
  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!profileUserId || !name) {
      console.error("Missing profile info", { profileUserId, name });
      return;
    }

    openChat(String(profileUserId), name, profileImage, true);
    toast(`Opening conversation with ${name}...`, { closeButton: true });
  };

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

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isFollowStatusLoading || !followCounts) {
    return <ProfileHeaderSkeleton />;
  }

  const handleReportSubmit = async (category: string, reason?: string) => {
    console.log("Reporting user ID:", profileUserId);
    console.log("Category:", category);
    console.log("Reason:", reason);
    setShowReportOptions(false);
  };

  const socialIcons: Record<string, string> = {
    website: "https://img.icons8.com/fluency-systems-regular/48/globe--v1.png",
    twitter: "https://img.icons8.com/color/48/twitter--v1.png",
    facebook: "https://img.icons8.com/color/48/facebook-new.png",
    instagram: "https://img.icons8.com/fluency/48/instagram-new.png",
    linkedin: "https://img.icons8.com/color/48/linkedin--v1.png",
    tiktok: "https://img.icons8.com/color/48/tiktok--v1.png",
    youtube: "https://img.icons8.com/color/48/youtube-play.png",
    pinterest: "https://img.icons8.com/color/48/pinterest--v1.png",
    snapchat: "https://img.icons8.com/color/48/snapchat.png",
    reddit: "https://img.icons8.com/color/48/reddit.png",

    // Artist-focused platforms
    behance: "https://img.icons8.com/color/48/behance.png",
    dribbble: "https://img.icons8.com/color/48/dribbble.png",
    artstation: "https://img.icons8.com/color/48/artstation.png",
    deviantart: "https://img.icons8.com/color/48/deviantart.png",
    patreon: "https://img.icons8.com/color/48/patreon.png",
    etsy: "https://img.icons8.com/color/48/etsy.png",
    twitch: "https://img.icons8.com/color/48/twitch.png",
    discord: "https://img.icons8.com/color/48/discord-new.png",
  };


  return (
    <div className="w-full px-4">
      {/* Cover Photo */}
      <div className="relative w-full h-52 md:h-72 rounded-lg overflow-hidden bg-blue-100 object-cover">
        <img src={cover} className="w-full h-full object-cover" />
        {/* Social Links */}
        <div className="absolute top-4 right-5 flex space-x-2 z-30">
          {!isSocialsLoading &&
            socials.length > 0 &&
            socials.map((social) => {
              const urlParts = social.url.split("/");
              const usernameFromUrl = urlParts[urlParts.length - 1] || social.platform;

              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-start"
                >
                  <div className="flex items-center opacity-90 bg-white rounded-full px-[10px] py-[7px] w-9 group-hover:w-36 overflow-hidden transition-all duration-300 ease-in-out shadow-md">
                    <img
                      src={socialIcons[social.platform.toLowerCase()] || socialIcons.website}
                      alt={social.platform}
                      className="w-4 h-4 object-contain"
                    />
                    <span className="ml-2 text-[10px] text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {usernameFromUrl}
                    </span>
                  </div>
                </a>
              );
            })}
        </div>
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

        {/* Stats - Replaced with FollowModals component */}
        <div className="flex space-x-2">
          <FollowModals followersCount={followCounts?.followers ?? 0} followingCount={followCounts?.following ?? 0} />

          {/* Items count - separate from FollowModals */}
          <div className="flex items-center space-x-2 mt-1.5 text-[10px] md:text-[11px]">
            <span>•</span>
            <span>
              <strong>{items}</strong> items
            </span>
          </div>
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

            {/* CONTACT USER */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full border border-gray-300 p-2 w-8 h-8">
                  <i className="bx bx-envelope text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={4}
                className="z-50 bg-white p-2 shadow-lg rounded-md min-w-[140px] animate-fade-in"
                forceMount
              >
                <DropdownMenuItem
                  className="cursor-pointer text-[10px] hover:bg-gray-100 rounded px-2 py-1"
                  onClick={handleContact}
                >
                  Message
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-[10px] hover:bg-gray-100 rounded px-2 py-1">
                  {email || "user@email.com"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* MENU OPTIONS */}
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
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setShowReportOptions(true);
                    setOptionsOpen(false);
                  }}
                  className="cursor-pointer text-[10px] hover:bg-gray-100 rounded px-2 py-1"
                >
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <EditProfile />
        )}
      </div>
      <ReportOptionsPopup
        isOpen={showReportOptions}
        onClose={() => setShowReportOptions(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default ProfileHeader;
