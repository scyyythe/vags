import React, { useEffect, useState } from "react";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  imageUrl?: string;
}

const ProfileHeader = ({ name, email, imageUrl }: ProfileHeaderProps) => {
  const userId = getLoggedInUserId();
  const { firstName, lastName, profilePicture, email: fetchedEmail, isLoading, error } = useUserDetails(userId);

  const { language: selectedLanguage } = useLanguage();

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  const [userData, setUserData] = useState({
    name: fullName || "",
    email: fetchedEmail || "",
  });

  useEffect(() => {
    if (!isLoading && !error) {
      setUserData({
        name: fullName || "",
        email: fetchedEmail || "",
      });
    }
  }, [firstName, lastName, fetchedEmail, isLoading, error]);

  // Auto-translate full name and email
  const translatedName = useAutoTranslation(userData.name || "Unknown", selectedLanguage);
  const translatedEmail = useAutoTranslation(userData.email || "Unknown", selectedLanguage);

  // Translate fallback initial (like "U" for Unknown)
  const fallbackInitial = useAutoTranslation("U", selectedLanguage);

  const getAvatarText = (firstName: string) => {
    return firstName ? firstName.charAt(0).toUpperCase() : fallbackInitial;
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-300 text-white text-xl">
        {profilePicture ? (
          <img src={profilePicture} alt={translatedName} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <span>{getAvatarText(firstName || fallbackInitial)}</span>
        )}
      </div>
      <div>
        <h2 className="text-xs font-bold text-gray-900">{translatedName}</h2>
        <p className="text-gray-500 text-[10px]">{translatedEmail}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
