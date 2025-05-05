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
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Photo</p>
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
            <img
              src={formData.photo}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex flex-col justify-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={triggerFileInput}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Change
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Full name</label>
            <div className="relative">
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="w-full pr-10"
              />
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => {}}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-2">Username</label>
            <div className="relative">
              <Input
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full pr-10"
              />
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => {}}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
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
