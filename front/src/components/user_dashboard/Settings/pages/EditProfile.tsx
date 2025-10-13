import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActionButtons from "../components/ActionButtons";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useSocials } from "@/hooks/users/social/useSocials";
import { useAddSocial } from "@/hooks/users/social/useSocials";
import { useDeleteSocial } from "@/hooks/users/social/useSocials";
type Social = {
  platform: string;
  url: string;
};

const EditProfile = () => {
  const userId = getLoggedInUserId();
  const {
    username,
    firstName,
    email,
    lastName,
    profilePicture,
    cover_photo,
    gender,
    dateOfBirth,
    address,
    isLoading,
    error,
  } = useUserDetails(userId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const { mutate: updateUser } = useUpdateUserDetails();
  const { data: socials = [] } = useSocials(userId);
  const { mutate: addSocial } = useAddSocial(userId);
  const { mutate: deleteSocial } = useDeleteSocial(userId);

  const [formData, setFormData] = useState<{
    fullName: string;
    username: string;
    email: string;
    profile_picture: File | null;
    cover_photo: File | null;
  }>({
    fullName: "",
    username: "",
    email: "",
    profile_picture: null,
    cover_photo: null,
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [removeCoverPhoto, setRemoveCoverPhoto] = useState(false);

  const { language: selectedLanguage } = useLanguage();

  // Auto-translated labels, placeholders, and messages
  const editProfileLabel = useAutoTranslation("Edit Profile", selectedLanguage);
  const coverPhotoLabel = useAutoTranslation("Cover Photo", selectedLanguage);
  const noCoverPhotoText = useAutoTranslation("No cover photo uploaded", selectedLanguage);
  const profilePicLabel = useAutoTranslation("Profile Picture", selectedLanguage);
  const fullNameLabel = useAutoTranslation("Full name", selectedLanguage);
  const usernameLabel = useAutoTranslation("Username", selectedLanguage);
  const translatedFullName = useAutoTranslation(formData.fullName || "", selectedLanguage);
  const translatedUsername = useAutoTranslation(formData.username || "", selectedLanguage);
  const socialMediaLabel = useAutoTranslation("Social Media", selectedLanguage);
  const socialInputPlaceholder = useAutoTranslation("Enter your social media link", selectedLanguage);
  const addButtonText = useAutoTranslation("Add", selectedLanguage);
  const invalidUrlText = useAutoTranslation("Invalid URL", selectedLanguage);
  const alreadyAddedText = useAutoTranslation("You already added your", selectedLanguage);
  const accountAddedText = useAutoTranslation("account added successfully!", selectedLanguage);
  const contactEmailLabel = useAutoTranslation("Contact Email (for inquiries)", selectedLanguage);
  const contactEmailPlaceholder = useAutoTranslation("Enter your contact email", selectedLanguage);
  const emailHelperText = useAutoTranslation(
    "This email will be shown publicly for inquiries or contact purposes.",
    selectedLanguage
  );
  const updatingDetailsText = useAutoTranslation("Updating your details...", selectedLanguage);
  const updatingDetailsDesc = useAutoTranslation("Please wait while we process your update.", selectedLanguage);
  const userUpdatedSuccess = useAutoTranslation("User details updated successfully!", selectedLanguage);
  const userUpdateFailed = useAutoTranslation("Failed to update user details.", selectedLanguage);
  const invalidEmailText = useAutoTranslation("Please enter a valid email address.", selectedLanguage);
  const removeText = useAutoTranslation("Remove", selectedLanguage);
  const uploadValidImageText = useAutoTranslation(
    "Please upload a valid image file (JPG, JPEG, PNG).",
    selectedLanguage
  );

  useEffect(() => {
    if (!isLoading && !error && firstName && lastName && username) {
      const fullName = `${firstName} ${lastName}`;

      const updatedForm = {
        fullName,
        username,
        email: email || "",
        profile_picture: null,
        cover_photo: null,
      };

      setFormData(updatedForm);
      setOriginalData(updatedForm);
    }
  }, [firstName, lastName, username, email, isLoading, error]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(fileType)) {
        alert(uploadValidImageText);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_picture: file,
      }));

      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(fileType)) {
        alert(uploadValidImageText);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        cover_photo: file,
      }));

      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCoverFileInput = () => coverFileInputRef.current?.click();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidUsername = (username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username);

  const handleSave = () => {
    if (!isValidEmail(formData.email)) {
      toast.error(invalidEmailText, { closeButton: true });
      return;
    }

    if (!isValidUsername(formData.username)) {
      toast.error("Username must be 3-20 characters, letters/numbers/underscores only.", { closeButton: true });
      return;
    }

    const loadingToast = toast(updatingDetailsText, { description: updatingDetailsDesc });

    const [firstName, ...rest] = formData.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    const updatedUser = new FormData();
    updatedUser.append("first_name", firstName);
    updatedUser.append("last_name", lastName);
    updatedUser.append("username", formData.username);
    updatedUser.append("email", formData.email);

    if (formData.profile_picture) updatedUser.append("profile_picture", formData.profile_picture);
    if (formData.cover_photo) updatedUser.append("cover_photo", formData.cover_photo);
    if (removeProfilePic) updatedUser.append("remove_profile_picture", "true");
    if (removeCoverPhoto) updatedUser.append("remove_cover_photo", "true");

    updateUser([userId, updatedUser], {
      onSuccess: () => {
        setOriginalData({ ...formData });
        setRemoveProfilePic(false);
        setRemoveCoverPhoto(false);
        toast.success(userUpdatedSuccess, { closeButton: true });
        toast.dismiss(loadingToast);
      },
      onError: () => {
        toast.error(userUpdateFailed, { closeButton: true });
        toast.dismiss(loadingToast);
      },
    });
  };
  const handleReset = () => setFormData({ ...originalData });
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData) || removeProfilePic || removeCoverPhoto;
  };

  const handleRemoveProfilePicture = () => {
    setFormData((prev) => ({ ...prev, profile_picture: null }));
    setPreviewUrl(null);
    setRemoveProfilePic(true);

    // Show toast for removal
    const removalToast = toast.success("Profile picture removed. Save to apply changes.", {
      closeButton: true,
    });

    setTimeout(() => toast.dismiss(removalToast), 3000);
  };

  const handleRemoveCoverPhoto = () => {
    setFormData((prev) => ({ ...prev, cover_photo: null }));
    setCoverPreviewUrl(null);
    setRemoveCoverPhoto(true);

    const removalToast = toast.success("Cover photo removed. Save to apply changes.", {
      closeButton: true,
    });

    setTimeout(() => toast.dismiss(removalToast), 3000);
  };

  const [socialInput, setSocialInput] = useState("");
  const [localSocials, setLocalSocials] = useState<{ [platform: string]: string }>({});
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
      toast.error(invalidUrlText, { closeButton: true });
      return;
    }

    const existing = socials.find((s) => s.platform === platform);
    if (existing) {
      toast.error(`${alreadyAddedText} ${platform} account.`, { closeButton: true });
      return;
    }

    addSocial(
      { platform, url: socialInput },
      {
        onSuccess: () => {
          toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} ${accountAddedText}`, {
            closeButton: true,
          });

          setSocialInput("");
        },
        onError: (err: any) => {
          console.error(err);
          toast.error("Failed to add social account", { closeButton: true });
        },
      }
    );
  };

  const handleSaveEmail = () => {
    if (!isValidEmail(formData.email)) {
      toast.error(invalidEmailText, { closeButton: true });
      return;
    }

    const loadingToast = toast(updatingDetailsText, { description: updatingDetailsDesc });

    const [firstName, ...rest] = formData.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    const updatedUser = new FormData();
    updatedUser.append("first_name", firstName);
    updatedUser.append("last_name", lastName);
    updatedUser.append("username", formData.username);
    updatedUser.append("email", formData.email);

    // ...rest of your existing logic
  };

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">{editProfileLabel}</h2>

      {/* Cover Photo */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-4">{coverPhotoLabel}</p>
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
          {coverPreviewUrl || cover_photo ? (
            <div className="relative w-full max-w-4xl">
              <img src={coverPreviewUrl || cover_photo} alt="Cover" className="w-full h-48 object-cover rounded-md" />
              <button
                onClick={triggerCoverFileInput}
                className="absolute bottom-2 right-2 bg-white p-2 shadow hover:bg-gray-100 text-[10px] font-medium py-1 px-2 rounded-full text-gray-800"
              >
                <i className="bx bx-camera text-sm"></i>
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-4xl h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs font-medium">
              {noCoverPhotoText}
              <button
                onClick={triggerCoverFileInput}
                className="absolute bottom-2 right-2 bg-white p-2 shadow hover:bg-gray-100 text-[10px] font-medium py-1 px-2 rounded-full text-gray-800"
              >
                <i className="bx bx-camera text-sm"></i>
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
              {removeText}
            </button>
          )}
        </div>
      </div>

      {/* Profile Picture */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-4">{profilePicLabel}</p>
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
                <i className="bx bx-camera text-sm"></i>
              </button>
            </div>
          ) : (
            <div className="relative w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
              {formData.fullName.charAt(0).toUpperCase() || "U"}
              <button
                onClick={triggerFileInput}
                className="absolute bottom-2 right-2 bg-white shadow hover:bg-gray-100 text-[10px] font-medium px-2 rounded-full text-gray-800"
              >
                <i className="bx bx-camera text-sm"></i>
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
          {(formData.profile_picture || profilePicture) && (
            <button
              onClick={handleRemoveProfilePicture}
              className="text-[10px] font-medium py-2 px-3 rounded-full bg-red-600 hover:bg-red-500 text-white"
            >
              {removeText}
            </button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-md px-4 py-4 mb-2">
          <label className="block text-[10px] text-gray-500 pl-3">{fullNameLabel}</label>
          <Input
            value={translatedFullName}
            disabled
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full font-semibold -mb-2 p-none border-none focus:ring-0 shadow-none"
            style={{ border: "none", fontSize: "12px", boxShadow: "none", outline: "none" }}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-md px-4 py-4 mb-2">
          <label className="block text-[10px] text-gray-500 pl-3">{usernameLabel}</label>
          <Input
            value={translatedUsername}
            onChange={(e) => handleChange("username", e.target.value)}
            className="w-full font-semibold -mb-2 p-none border-none focus:ring-0 shadow-none"
            style={{ border: "none", fontSize: "12px", boxShadow: "none", outline: "none" }}
          />
        </div>

        {/* Social Media Links */}
        <div className="mb-6">
          <p className="text-[11px] text-gray-500 mb-2">{socialMediaLabel}</p>
          <div className="flex gap-2 items-center">
            <Input
              type="url"
              placeholder={socialInputPlaceholder}
              value={socialInput}
              onChange={(e) => setSocialInput(e.target.value)}
              className="w-full h-8 rounded-full ring-0 focus:outline-none focus:ring-0"
              style={{ fontSize: "11px" }}
            />
            <Button onClick={handleAddSocial} className="h-8 text-[11px] rounded-full">
              {addButtonText}
            </Button>
          </div>

          {socials.length > 0 && (
            <ul className="text-[11px] mt-3">
              {socials.map((social: Social) => (
                <li key={social.platform} className="flex space-x-2 w-full max-w-xs">
                  <span className="text-gray-600 font-medium capitalize">{social.platform}:</span>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline truncate max-w-[200px]"
                  >
                    {social.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contact Email */}
        <div className="mb-4">
          <label className="block text-[11px] text-gray-500 mb-2" htmlFor="email">
            {contactEmailLabel}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={contactEmailPlaceholder}
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full h-8 rounded-full ring-0 focus:outline-none focus:ring-0"
            style={{ fontSize: "11px" }}
          />
          <p className="text-[8px] text-gray-400 mt-1">{emailHelperText}</p>
        </div>
      </div>

      <ActionButtons hasChanges={hasChanges()} onSave={handleSave} onReset={handleReset} />
    </div>
  );
};

export default EditProfile;
