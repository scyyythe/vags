import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActionButtons from "../components/ActionButtons";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";
import { toast } from "sonner";

const EditProfile = () => {
  const userId = getLoggedInUserId();
  const { username, firstName, lastName, profilePicture, cover_photo, isLoading, error } = useUserDetails(userId);
  const fullName = `${firstName} ${lastName}`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const { mutate: updateUser } = useUpdateUserDetails();

  const [formData, setFormData] = useState<{
    fullName: string;
    username: string;
    profile_picture: File | null;
    cover_photo: File | null;
  }>({
    fullName: "",
    username: "",
    profile_picture: null,
    cover_photo: null,
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !error && firstName && lastName && username) {
      const fullName = `${firstName} ${lastName}`;

      const updatedForm = {
        fullName,
        username,
        profile_picture: null,
        cover_photo: null,
      };

      setFormData(updatedForm);
      setOriginalData(updatedForm);
    }
  }, [firstName, lastName, username, isLoading, error]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for profile picture change (existing)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(fileType)) {
        alert("Please upload a valid image file (JPG, JPEG, PNG).");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_picture: file,
      }));

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // New handler for cover photo change
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(fileType)) {
        alert("Please upload a valid image file (JPG, JPEG, PNG).");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        cover_photo: file,
      }));

      const preview = URL.createObjectURL(file);
      setCoverPreviewUrl(preview);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCoverFileInput = () => {
    coverFileInputRef.current?.click();
  };

  const handleSave = () => {
    const loadingToast = toast("Updating your details...", {
      description: "Please wait while we process your update.",
    });
    const [firstName, ...rest] = formData.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    const updatedUser = new FormData();
    updatedUser.append("first_name", firstName);
    updatedUser.append("last_name", lastName);
    updatedUser.append("username", formData.username);

    if (formData.profile_picture) {
      updatedUser.append("profile_picture", formData.profile_picture);
    }
    if (formData.cover_photo) {
      updatedUser.append("cover_photo", formData.cover_photo);
    }

    updateUser([userId, updatedUser], {
      onSuccess: (data) => {
        setOriginalData({ ...formData });

        if (formData.profile_picture) {
          setPreviewUrl(URL.createObjectURL(formData.profile_picture));
        }
        if (formData.cover_photo) {
          setCoverPreviewUrl(URL.createObjectURL(formData.cover_photo));
        }

        toast.success("User details updated successfully!");
        toast.dismiss(loadingToast);
      },
      onError: (error) => {
        toast.error("Failed to update user details.");
        toast.dismiss(loadingToast);
      },
    });
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

      {/* Cover Photo Upload Container */}
      <div className="mb-8">
        <p className="text-xs pl-12 text-gray-500 mb-4">Cover Photo</p>
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
          {coverPreviewUrl ? (
            <img src={coverPreviewUrl} alt="Cover" className="w-full max-w-4xl h-48 object-cover rounded-md" />
          ) : cover_photo ? (
            <img src={cover_photo} alt="Cover" className="w-full max-w-4xl h-48 object-cover rounded-md" />
          ) : (
            <div className="w-full max-w-4xl h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs font-medium">
              No cover photo uploaded
            </div>
          )}

          <div className="flex flex-col justify-center relative top-20">
            <input
              type="file"
              ref={coverFileInputRef}
              onChange={handleCoverPhotoChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={triggerCoverFileInput}
              className="text-[10px] font-medium py-2 px-3 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Change Cover Photo
            </button>
          </div>
        </div>
      </div>

      {/* Existing Profile Picture Container */}
      <div className="mb-8">
        <p className="text-xs pl-12 text-gray-500 mb-4">Photo</p>
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
          {formData.profile_picture ? (
            <img
              src={URL.createObjectURL(formData.profile_picture)}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
              {fullName.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="flex flex-col justify-center relative top-12">
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
            <button
              onClick={triggerFileInput}
              className="text-[10px] font-medium py-2 px-3 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Rest of your form (Full name, Username, etc.) remains unchanged */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-md px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-gray-500 pl-3">Full name</label>
              <div className="relative">
                <Input
                  value={formData.fullName}
                  disabled={true}
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
                ></button>
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
              <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600" onClick={() => {}}></button>
            </div>
          </div>
        </div>
      </div>

      <ActionButtons hasChanges={hasChanges()} onSave={handleSave} onReset={handleReset} />
    </div>
  );
};

export default EditProfile;
