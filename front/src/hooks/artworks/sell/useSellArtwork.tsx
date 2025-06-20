import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";  // Assuming this is an axios instance

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
    formData.append("year_created", year_created);
    formData.append("category", style);
    formData.append("medium", medium);
    formData.append("size", `${height}x${width}`);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("edition", edition);
    formData.append("quantity", quantity);
    formData.append("images", mainImage);

    additionalImages.forEach((img) => {
      if (img) formData.append("images", img);
    });

    try {
      // Correctly call the API
      await apiClient.post("/artworks/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Artwork listed successfully!", { id: "upload" });
      navigate("/marketplace");
    } catch (err) {
      toast.error("Failed to list artwork", { id: "upload" });
      console.error("Submit error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, sellArtwork };
};

export default useSellArtwork;
