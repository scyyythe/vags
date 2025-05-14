import React from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate("/settings/edit-profile");
  };

  return (
    <div className="w-full h-full flex justify-center items-center px-4">
      {/* Edit Profile Button */}
      <div className="flex items-center space-x-2 mt-4 relative">
        <button
          onClick={handleEditProfile}
          className="flex items-center px-4 py-[6px] rounded-full text-white text-[10px] bg-red-800 hover:bg-red-700"
        >
          <i className="bx bx-edit-alt mr-3"></i>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
