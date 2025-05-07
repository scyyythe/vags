import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActionButtons from "../components/ActionButtons";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "Angel Canete",
    username: "angelbaby",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    setOriginalData({ ...formData });
  };

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Edit Profile</h2>
      
      <div className="mb-8">
        <p className="text-xs pl-12 text-gray-500 mb-4">Photo</p>
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
          <img
            src={formData.photo}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="flex flex-col justify-center relative top-12">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              className="text-[10px] font-medium py-2 px-3 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Change
            </button>
          </div>
        </div>
      </div>  

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-md px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-gray-500 pl-3">Full name</label>
              <div className="relative">
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full font-semibold -mb-2 p-none border-none focus:ring-0 shadow-none"
                  style={{
                    border: "none",
                    fontSize: "12px",
                    boxShadow: "none",
                    outline: "none",
                  }}
                />
                <button
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => {}}
                >
                </button>
              </div>
            </div> 
          </div> 
        </div>     

        <div className="bg-white border border-gray-200 rounded-md px-4 py-4"> 
          <div>
            <label className="block text-[10px] text-gray-500 pl-3">Username</label>
            <div className="relative">
              <Input
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full font-semibold -mb-2 p-none border-none focus:ring-0 shadow-none"
                style={{
                  border: "none",
                  fontSize: "12px",
                  boxShadow: "none",
                  outline: "none",
                }}
              />
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => {}}
              >
              </button>
            </div>
          </div>
        </div>
      </div>  
      
      <ActionButtons
        hasChanges={hasChanges()}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
};

export default EditProfile;
