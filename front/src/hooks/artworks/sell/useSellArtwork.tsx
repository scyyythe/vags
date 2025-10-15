import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";

interface SellArtworkInput {
  title: string;
  year_created: string;
  style: string;
  medium: string;
  height: string;
  width: string;
  description: string;
  price: string;
  edition: string;
  quantity: string;
  mainImage: File | null;
  additionalImages: (File | null)[];
}

const useSellArtwork = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sellArtwork = async (data: SellArtworkInput) => {
    const {
      title,
      year_created,
      style,
      medium,
      height,
      width,
      description,
      price,
      edition,
      quantity,
      mainImage,
      additionalImages,
    } = data;

    if (!title.trim()) return toast.error("Artwork title is required.");
    if (!mainImage) return toast.error("Artwork image is required.");
    if (!price) return toast.error("Price is required.");

    setIsUploading(true);
    toast.loading("Listing artwork...", { id: "upload" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("year_created", year_created.slice(0, 10));
    formData.append("category", style);
    formData.append("medium", medium);
    formData.append("size", `${height}x${width}`);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("edition", edition);
    formData.append("quantity", quantity);
    formData.append("images", mainImage);
    formData.append("visibility", "Public");
    formData.append("art_status", "onSale");

    additionalImages.forEach((img) => {
      if (img) formData.append("images", img);
    });

    try {
      await apiClient.post("/art/sell/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Invalidate and refetch all relevant marketplace queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] }),
        queryClient.invalidateQueries({ queryKey: ["trending-artworks"] }),
        queryClient.invalidateQueries({ queryKey: ["followedArtworks"] }),
        queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] }),
        queryClient.invalidateQueries({ queryKey: ["artworks"] }),
        queryClient.invalidateQueries({ queryKey: ["popular-artworks"] }),
        queryClient.invalidateQueries({ queryKey: ["popularArtworks"] }),
        queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] }),
        queryClient.invalidateQueries({ queryKey: ["top-artworks"] }),
        queryClient.invalidateQueries({ queryKey: ["top-sellers"] }),
      ]);

      // Clear all artwork-related caches to ensure fresh data
      queryClient.removeQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.removeQueries({ queryKey: ["artworks"] });

      // Force refetch the marketplace data
      await queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });

      // Small delay to ensure backend processing is complete
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Artwork listed successfully!", { id: "upload", closeButton: true });

      navigate("/marketplace");
    } catch (err: any) {
      console.error("Submit error:", err.response?.data || err.message);

      let errorMessage = "Failed to list artwork";
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

      toast.error(errorMessage, { id: "upload", closeButton: true });
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, sellArtwork };
};

export default useSellArtwork;
