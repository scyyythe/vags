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

  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [removeCoverPhoto, setRemoveCoverPhoto] = useState(false);

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

    if (removeProfilePic) {
      updatedUser.append("remove_profile_picture", "true");
    }
    if (removeCoverPhoto) {
      updatedUser.append("remove_cover_photo", "true");
    }

    updateUser([userId, updatedUser], {
      onSuccess: () => {
        setOriginalData({ ...formData });
        setRemoveProfilePic(false);
        setRemoveCoverPhoto(false);
        toast.success("User details updated successfully!");
        toast.dismiss(loadingToast);
      },
      onError: () => {
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

  const handleRemoveProfilePicture = () => {
    setFormData((prev) => ({ ...prev, profile_picture: null }));
    setPreviewUrl(null);
    setRemoveProfilePic(true);
  };

  const handleRemoveCoverPhoto = () => {
    setFormData((prev) => ({ ...prev, cover_photo: null }));
    setCoverPreviewUrl(null);
    setRemoveCoverPhoto(true);
  };

  // SOCIAL MEDIA PLATFORMS
  const [socialInput, setSocialInput] = useState("");
  const [socials, setSocials] = useState<{ [platform: string]: string }>({});

  const extractPlatform = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      if (domain.includes("facebook")) return "facebook";
      if (domain.includes("twitter")) return "twitter";
      if (domain.includes("instagram")) return "instagram";
      if (domain.includes("linkedin")) return "linkedin";
      if (domain.includes("tiktok")) return "tiktok";
      return "other";
    } catch {
      return null;
    }
  };

  const handleAddSocial = () => {
    const platform = extractPlatform(socialInput);
    if (!platform) {
      toast.error("Invalid URL");
      return;
    }

    if (socials[platform]) {
      toast.error(`You already added your ${platform} account.`);
      return;
    }

    setSocials((prev) => ({ ...prev, [platform]: socialInput }));
    setSocialInput(""); // Clear input
  };

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Edit Profile</h2>

      {/* Cover Photo Upload Container */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-4">Cover Photo</p>
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
            {coverPreviewUrl || cover_photo ? (
            <div className="relative w-full max-w-4xl">
              <img
                src={coverPreviewUrl || cover_photo}
                alt="Cover"
                className="w-full h-48 object-cover rounded-md"
              />
              <button
                onClick={triggerCoverFileInput}
                className="absolute bottom-2 right-2 bg-white p-2 shadow hover:bg-gray-100 text-[10px] font-medium py-1 px-2 rounded-full text-gray-800"
              >
                <i className='bx bx-camera text-sm'></i>
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-4xl h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs font-medium">
              No cover photo uploaded
              <button
                onClick={triggerCoverFileInput}
                className="absolute bottom-2 right-2 bg-white p-2 shadow hover:bg-gray-100 text-[10px] font-medium py-1 px-2 rounded-full text-gray-800"
              >
                <i className='bx bx-camera text-sm'></i>
              </button>
            </div>
          )}
      
            <input
              type="file"
              ref={coverFileInputRef}
              onChange={handleCoverPhotoChange}
              accept="image/*"
              className="hidden"
            />

            {(coverPreviewUrl || cover_photo) && (
              <button
                onClick={handleRemoveCoverPhoto}
                className="text-[10px] font-medium py-2 px-3 rounded-full bg-red-600 hover:bg-red-500 text-white"
              >
                Remove
              </button>
            )}
         
        </div>
      </div>

      {/* Profile Picture Container */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-4">Profile Picture</p>
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
          {formData.profile_picture || profilePicture ? (
          <div className="relative w-32 h-32">
            <img
              src={formData.profile_picture ? URL.createObjectURL(formData.profile_picture) : profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <button
              onClick={triggerFileInput}
              className="absolute bottom-2 right-2 bg-white p-2 shadow hover:bg-gray-100 text-[10px] font-medium py-1 px-2 rounded-full text-gray-800"
            >
              <i className='bx bx-camera text-sm'></i>
            </button>
          </div>
        ) : (
          <div className="relative w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
            {fullName.charAt(0).toUpperCase() || "U"}
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 bg-white shadow hover:bg-gray-100 text-[10px] font-medium px-2 rounded-full text-gray-800"
                >
                  <i className='bx bx-camera text-sm'></i>
                </button>
              </div>
            )}
    
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
            
            {(formData.profile_picture || profilePicture) && (
              <button
                onClick={handleRemoveProfilePicture}
                className="text-[10px] font-medium py-2 px-3 rounded-full bg-red-600 hover:bg-red-500 text-white"
              >
                Remove
              </button>
            )}

        </div>
      </div>

      {/* Social Media Links */}
      <div className="mb-6">
        <p className="text-[11px] text-gray-500 mb-2">Social Media</p>
        <div className="flex gap-2 items-center">
          <Input
            type="url"
            placeholder="Enter your social media link"
            value={socialInput}
            onChange={(e) => setSocialInput(e.target.value)}
            className="w-full h-8 max-w-md rounded-full ring-0 focus:outline-none focus:ring-0"
            style={{ fontSize: "11px", }}
          />
          <Button onClick={handleAddSocial} className="h-8 text-[11px] rounded-full">Add</Button>
        </div>

        {Object.keys(socials).length > 0 && (
          <ul className="text-[11px] mt-3">
            {Object.entries(socials).map(([platform, link]) => (
              <li key={platform} className="flex space-x-2 w-full max-w-xs">
                <span className="text-gray-600 font-medium capitalize">{platform}:</span>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate max-w-[200px]">{link}</a>
              </li>
            ))}
          </ul>
        )}
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
