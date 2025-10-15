import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";

interface UpdateArtworkInput {
  title?: string;
  year_created?: string;
  style?: string;
  medium?: string;
  height?: string;
  width?: string;
  description?: string;
  price?: string;
  edition?: string;
  quantity?: string;
  mainImage?: File | null;
  size?: string;
  additionalImages?: (File | null)[];
  removeExistingImages?: boolean;
}

const useUpdateArtwork = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateArtwork = async (artworkId: string, data: UpdateArtworkInput) => {
    setIsUpdating(true);
    toast.loading("Updating artwork...", { id: "update" });

    try {
      const formData = new FormData();

      const textFields = ["title", "year_created", "style", "medium", "description", "price", "edition", "quantity"];

      textFields.forEach((field) => {
        const value = (data as any)[field];
        if (value !== undefined && value !== null) {
          formData.append(field, value);
        }
      });

      if (data.height && data.width) {
        formData.append("height", data.height);
        formData.append("width", data.width);
        formData.append("size", `${data.height}x${data.width}`);
      }

      if (data.mainImage) formData.append("main_image", data.mainImage);

      if (data.additionalImages && data.additionalImages.length > 0) {
        if (data.removeExistingImages) formData.append("remove_existing_images", "true");
        data.additionalImages.forEach((img) => {
          if (img) formData.append("additional_images", img);
        });
      }

      await apiClient.patch(`/art/update/${artworkId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Artwork updated successfully", { id: "update", closeButton: true });

      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["artworks"], exact: false });

      navigate("/marketplace");
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err.message);

      let errorMessage = "Failed to update artwork";
      const errors = err.response?.data;

      if (errors) {
        if (Array.isArray(errors) && errors.length > 0) {
          const firstError = errors[0];

          // Handle Cloudinary error format
          if (typeof firstError === "string" && firstError.includes("cloudinary")) {
            try {
              const cloudinaryMatch = firstError.match(/ErrorDetail\(string="([^"]+)"/);
              if (cloudinaryMatch) {
                errorMessage = cloudinaryMatch[1];
              } else {
                errorMessage = "Image content was rejected. Please upload a different image.";
              }
            } catch (parseError) {
              errorMessage = "Image content was rejected. Please upload a different image.";
            }
          } else {
            errorMessage = firstError;
          }
        } else if (errors?.detail) {
          errorMessage = errors.detail;
        } else if (errors?.error) {
          if (Array.isArray(errors.error)) {
            errorMessage = errors.error[0];
          } else if (typeof errors.error === "string") {
            errorMessage = errors.error;
          }
        }
      }

      toast.error(errorMessage, {
        id: "update",
        closeButton: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateArtwork };
};

export default useUpdateArtwork;
