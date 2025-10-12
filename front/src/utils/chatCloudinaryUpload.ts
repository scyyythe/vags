// Utility function for uploading chat images to Cloudinary
export const uploadChatImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "user_artwork_uploads"); // Using existing preset
  formData.append("folder", "chat_images"); // Specific folder for chat images

  const res = await fetch("https://api.cloudinary.com/v1_1/du5bwye4h/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};

// Utility function for uploading chat files to Cloudinary
export const uploadChatFileToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "user_artwork_uploads"); // Using existing preset
  formData.append("folder", "chat_files"); // Specific folder for chat files

  const res = await fetch("https://api.cloudinary.com/v1_1/du5bwye4h/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};
