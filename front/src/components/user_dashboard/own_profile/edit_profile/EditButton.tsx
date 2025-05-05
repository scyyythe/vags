import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  bannerImage: string;
  profileImage: string;
  name: string;
  followers: number;
  following: number;
  items: number;
}

const EditProfile: React.FC<ProfileHeaderProps> = ({
  bannerImage,
  profileImage,
  name,
  followers,
  following,
  items
}) => {

    const navigate = useNavigate();

    const handleEditProfile = () => {
        navigate('/settings/edit-profile');
    };

  return (
    <div className="w-full px-4">
      {/* Banner */}
      <div className="w-full h-52 md:h-72 rounded-lg overflow-hidden bg-blue-100">
        <img 
          src={bannerImage} 
          alt="Profile Banner" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-14 md:-mt-14">
        {/* Profile Image */}
        <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden">
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

        {/* Edit Profile Button */}
        <div className="flex items-center space-x-2 mt-4 relative">
          <button 
          onClick={handleEditProfile}
          className="flex items-center px-4 py-[6px] rounded-full text-white text-[10px] bg-red-800 hover:bg-red-700">
            <i className='bx bx-edit-alt mr-3'></i>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
