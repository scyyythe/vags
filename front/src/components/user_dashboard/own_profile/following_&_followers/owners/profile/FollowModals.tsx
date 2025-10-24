import React, { useState, useEffect } from "react";
import UserListModal from "../../owners/common/UserListModal";
import { useUserLists } from "@/hooks/follow/useUserLists";
import { useParams } from "react-router-dom";
import { getLoggedInUserId } from "@/auth/decode";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface FollowModalsProps {
  followersCount: number;
  followingCount: number;
}

const FollowModals: React.FC<FollowModalsProps> = ({ followersCount, followingCount }) => {
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  const loggedInUserId = getLoggedInUserId();
  const { id: profileUserId } = useParams();

  // Language and translation
  const { language } = useLanguage();
  const followersText = useAutoTranslation("followers", language);
  const followingText = useAutoTranslation("following", language);
  const followersModalTitleText = useAutoTranslation("Followers", language);
  const followingModalTitleText = useAutoTranslation("Following", language);

  console.log("profileUserId:", profileUserId, typeof profileUserId);
  console.log("loggedInUserId:", loggedInUserId, typeof loggedInUserId);

  const isOwner = profileUserId === loggedInUserId;
  console.log("isOwner:", isOwner);

  const { followers, following, handleFollow, handleUnfollow, handleRemoveFollower } = useUserLists(
    profileUserId || ""
  );

  useEffect(() => {
    console.log(`Visited user ID: ${profileUserId}`);
    console.log("Followers list:", followers);
    console.log("Following list:", following);
  }, [profileUserId, followers, following]);

  return (
    <>
      <div className="flex items-center space-x-2 mt-2 text-[10px] md:text-[11px] text-gray-900 dark:text-gray-100">
        <button
          onClick={() => setFollowersModalOpen(true)}
          className="hover:underline cursor-pointer flex items-center space-x-1 text-gray-900 dark:text-gray-100"
        >
          <strong>{followersCount}</strong> <span>{followersText}</span>
        </button>
        <span className="text-gray-900 dark:text-gray-100">•</span>
        <button
          onClick={() => setFollowingModalOpen(true)}
          className="hover:underline cursor-pointer flex items-center space-x-1 text-gray-900 dark:text-gray-100"
        >
          <strong>{followingCount}</strong> <span>{followingText}</span>
        </button>
      </div>

      <UserListModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title={followersModalTitleText}
        users={followers}
        onFollow={handleFollow}
        onRemove={handleRemoveFollower}
        isOwner={isOwner}
      />

      <UserListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title={followingModalTitleText}
        users={following}
        onUnfollow={handleUnfollow}
        isOwner={isOwner}
      />
    </>
  );
};

export default FollowModals;
