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
  additionalImages?: (File | null)[];
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

      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          if (key === "height" || key === "width") return;
          formData.append(key, value as string | Blob);
        }
      });

      // combine height & width into size
      if (data.height && data.width) {
        formData.append("size", `${data.height}x${data.width}`);
      }

      if (data.mainImage) formData.append("images", data.mainImage);
      data.additionalImages?.forEach((img) => {
        if (img) formData.append("images", img);
      });

      await apiClient.patch(`/art/update/${artworkId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Artwork updated!", { id: "update", closeButton: true });

      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      navigate("/marketplace");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update artwork", { id: "update", closeButton: true });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateArtwork };
};

export default useUpdateArtwork;
