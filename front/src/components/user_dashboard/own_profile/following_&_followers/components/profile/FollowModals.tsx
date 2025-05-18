import React, { useState } from "react";
import UserListModal from "../common/UserListModal";
import { useUserLists } from "@/hooks/follow/useUserLists";
import { UserPlus, UserMinus, Users } from "lucide-react";

interface FollowModalsProps {
  userId: string;
  followersCount: number;
  followingCount: number;
}

const FollowModals: React.FC<FollowModalsProps> = ({ userId, followersCount, followingCount }) => {
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  
  const {
    followers,
    following,
    isLoading,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower
  } = useUserLists(userId);

  return (
    <>
      {/* Followers and Following counts with click handlers */}
      <div className="flex items-center space-x-2 mt-2 text-[10px] md:text-[11px]">
        <button
          onClick={() => setFollowersModalOpen(true)}
          className="hover:underline cursor-pointer flex items-center space-x-1"
        >
          <strong>{followersCount}</strong> <span>followers</span>
        </button>
        <span>•</span>
        <button
          onClick={() => setFollowingModalOpen(true)}
          className="hover:underline cursor-pointer flex items-center space-x-1"
        >
          <strong>{followingCount}</strong> <span>following</span>
        </button>
      </div>

      {/* Modals */}
      <UserListModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title="Followers"
        users={followers}
        onFollow={handleFollow}
        onRemove={handleRemoveFollower}
      />

      <UserListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="Following"
        users={following}
        onUnfollow={handleUnfollow}
      />
    </>
  );
};

export default FollowModals;
