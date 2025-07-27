import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type ReviewPayload = {
  artwork_id: string;
  purchase_id: string;
  rating: number;
  comment?: string;
  photos?: (string | File)[];
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "user_artwork_uploads");
  formData.append("folder", "review_photos");

  console.log("📤 Uploading to Cloudinary:", file.name);

  const res = await fetch("https://api.cloudinary.com/v1_1/du5bwye4h/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  console.log("✅ Cloudinary uploaded:", data.secure_url);
  return data.secure_url;
};

export const useSubmitReview = () => {
  return useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      const { photos = [], ...rest } = payload;

      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        if (typeof photo === "string" && photo.startsWith("http")) {
          console.log("🖼️ Using existing photo URL:", photo);
          uploadedUrls.push(photo);
        } else if (photo instanceof File) {
          console.log("📁 Uploading new photo file:", photo.name);
          const url = await uploadToCloudinary(photo);
          uploadedUrls.push(url);
        } else {
          console.warn("⚠️ Skipped invalid photo type:", photo);
        }
      }

      const finalPayload = {
        ...rest,
        photos: uploadedUrls,
      };

      console.log("📦 Submitting review payload:", finalPayload);

      const response = await apiClient.post("/submit-review/", finalPayload);
      console.log("✅ Review submitted successfully:", response.data);

      return response.data;
    },
  });
};
