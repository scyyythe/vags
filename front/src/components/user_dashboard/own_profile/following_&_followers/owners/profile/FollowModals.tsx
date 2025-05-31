import React, { useState, useEffect } from "react";
import UserListModal from "../../owners/common/UserListModal";
import { useUserLists } from "@/hooks/follow/useUserLists";
import { useParams } from "react-router-dom";
import { getLoggedInUserId } from "@/auth/decode";

interface FollowModalsProps {
  followersCount: number;
  followingCount: number;
}

const FollowModals: React.FC<FollowModalsProps> = ({ followersCount, followingCount }) => {
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  const loggedInUserId = getLoggedInUserId();
  const { id: profileUserId } = useParams();

  console.log("profileUserId:", profileUserId, typeof profileUserId);
  console.log("loggedInUserId:", loggedInUserId, typeof loggedInUserId);

  const isOwner = profileUserId === loggedInUserId;
  console.log("isOwner:", isOwner);

  const { followers, following, handleFollow, handleUnfollow, handleRemoveFollower } = useUserLists(
    profileUserId || ""
  );

  // Log followers and following lists whenever they change
  useEffect(() => {
    console.log(`Visited user ID: ${profileUserId}`);
    console.log("Followers list:", followers);
    console.log("Following list:", following);
  }, [profileUserId, followers, following]);

  return (
    <>
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

      <UserListModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title="Followers"
        users={followers}
        onFollow={handleFollow}
        onRemove={handleRemoveFollower}
        isOwner={isOwner}
      />

      <UserListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="Following"
        users={following}
        onUnfollow={handleUnfollow}
        isOwner={isOwner}
      />
    </>
  );
};

export default FollowModals;
