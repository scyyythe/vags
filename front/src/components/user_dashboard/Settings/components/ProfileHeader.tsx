import React from "react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  name: string;
  email: string;
  imageUrl: string;
}

const ProfileHeader = ({ name, email, imageUrl }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
      <img
        src={imageUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover"
      />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        <p className="text-gray-500 text-sm">{email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
