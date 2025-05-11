import React, { useEffect, useState } from "react";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  imageUrl?: string;
}

const ProfileHeader = ({ name, email, imageUrl }: ProfileHeaderProps) => {
  const userId = getLoggedInUserId();
  const { firstName, lastName, email: fetchedEmail, isLoading, error } = useUserDetails(userId);

  const [userData, setUserData] = useState({
    name: `${firstName} ${lastName}`,
    email: fetchedEmail,
  });

  useEffect(() => {
    if (!isLoading && !error) {
      setUserData({
        name: `${firstName} ${lastName}`,
        email: fetchedEmail,
      });
    }
  }, [firstName, lastName, fetchedEmail, isLoading, error]);

  const getAvatarText = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-300 text-white text-xl">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <span>{getAvatarText(firstName)}</span>
        )}
      </div>
      <div>
        <h2 className="text-xs font-bold text-gray-900">{userData.name}</h2>
        <p className="text-gray-500 text-[10px]">{userData.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
