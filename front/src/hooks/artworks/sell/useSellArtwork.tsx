import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
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

interface OptimizedSellData extends SellArtworkInput {
  // Additional fields for optimization
}

const useSellArtwork = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sellArtwork = useCallback(
    async (data: OptimizedSellData): Promise<void> => {
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

      // Lenient validation - only check for absolutely essential fields
      if (!title || title.trim().length === 0) {
        toast.error("Please enter an artwork title.");
        return;
      }
      if (!mainImage) {
        toast.error("Please upload at least one image of your artwork.");
        return;
      }
      if (!price || price.trim().length === 0) {
        toast.error("Please set a price for your artwork.");
        return;
      }

      // Optional validation with helpful suggestions
      if (title.trim().length < 3) {
        toast.error("Title should be at least 3 characters long.");
        return;
      }

      // Check if price is a valid number
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please enter a valid price greater than 0.");
        return;
      }

      setIsUploading(true);
      toast.loading("Listing artwork...", { id: "upload" });

      try {
        const formData = new FormData();
        formData.append("title", title.trim());

        // Provide defaults for optional fields
        formData.append("year_created", year_created?.slice(0, 10) || new Date().getFullYear().toString());
        formData.append("category", style || "General");
        formData.append("medium", medium?.trim() || "Mixed Media");
        formData.append("size", `${height || "Unknown"}x${width || "Unknown"}`);
        formData.append("description", description?.trim() || "Beautiful artwork");
        formData.append("price", Math.round(priceNum).toString()); // Use validated price number
        formData.append("edition", edition || "Original (1 of 1)");

        // Handle quantity - provide default for Open Edition
        if (edition === "Open Edition") {
          const qty = quantity && !isNaN(parseInt(quantity)) ? parseInt(quantity) : 1;
          formData.append("quantity", qty.toString());
        } else if (quantity && !isNaN(parseInt(quantity))) {
          formData.append("quantity", parseInt(quantity).toString());
        }

        formData.append("images", mainImage);
        formData.append("visibility", "Public"); // Capitalized to match backend model
        formData.append("art_status", "onSale");

        additionalImages.forEach((img) => {
          if (img) formData.append("images", img);
        });

        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("You must be logged in to list artwork.");
        }

        // Upload with increased timeout for large files
        const response = await apiClient.post("/art/sell/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          // Increase timeout for large files
          timeout: 120000, // 2 minutes
        });

        // Show success toast immediately
        toast.success("Artwork listed successfully!", {
          id: "upload",
          closeButton: true,
          duration: 3000,
          description: "Your artwork is now available in the marketplace",
        });

        // Navigate to marketplace immediately after successful save
        navigate("/marketplace");

        // Optimized query invalidation - invalidate all relevant queries in parallel (non-blocking)
        Promise.all([
          // Invalidate marketplace queries
          queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] }),
          queryClient.invalidateQueries({ queryKey: ["trending-artworks"] }),
          queryClient.invalidateQueries({ queryKey: ["followedArtworks"] }),
          queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] }),

          // Invalidate all artwork-related queries
          queryClient.invalidateQueries({ queryKey: ["artworks"] }),
          queryClient.invalidateQueries({ queryKey: ["popular-artworks"] }),
          queryClient.invalidateQueries({ queryKey: ["popularArtworks"] }),
          queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] }),
          queryClient.invalidateQueries({ queryKey: ["top-artworks"] }),
          queryClient.invalidateQueries({ queryKey: ["top-sellers"] }),

          // Invalidate user-specific queries
          queryClient.invalidateQueries({ queryKey: ["explore"] }),
          queryClient.invalidateQueries({ queryKey: ["feed"] }),
          queryClient.invalidateQueries({ queryKey: ["profile"] }),
          queryClient.invalidateQueries({ queryKey: ["user-artworks"] }),
        ]).then(() => {
          // Force refetch marketplace data after invalidation
          queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
        });

        return response.data;
      } catch (error: unknown) {
        console.error("Sell artwork error:", error);

        let errorMessage = "Failed to list artwork";

        if (error instanceof Error) {
          if (error.message.includes("timeout")) {
            errorMessage = "Upload timeout. Please try again with smaller images.";
          } else if (error.message.includes("size")) {
            errorMessage = "Images too large. Please use images smaller than 20MB each.";
          } else if (error.message.includes("rejected")) {
            errorMessage = "Image content was rejected. Please upload different images.";
          } else {
            errorMessage = error.message;
          }
        }

        // Handle API response errors
        if (error && typeof error === "object" && "response" in error) {
          const apiError = error as { response?: { data?: any; status?: number } };
          const errors = apiError.response?.data;
          const status = apiError.response?.status;

          if (errors) {
            // Handle validation errors (400 Bad Request)
            if (status === 400) {
              console.error("Validation Error Details:", errors);

              // Handle field-specific validation errors
              if (typeof errors === "object" && !Array.isArray(errors)) {
                const fieldErrors = Object.entries(errors).map(
                  ([field, message]) => `${field}: ${Array.isArray(message) ? message[0] : message}`
                );
                errorMessage = `Validation Error: ${fieldErrors.join(", ")}`;
              } else if (Array.isArray(errors) && errors.length > 0) {
                errorMessage = errors[0];
              } else {
                errorMessage = "Please check all required fields and try again.";
              }
            } else if (Array.isArray(errors) && errors.length > 0) {
              const firstError = errors[0];

              // Handle Cloudinary error format
              if (typeof firstError === "string" && firstError.includes("cloudinary")) {
                try {
                  const cloudinaryMatch = firstError.match(/ErrorDetail\(string="([^"]+)"/);
                  if (cloudinaryMatch) {
                    errorMessage = cloudinaryMatch[1];
                  } else {
                    errorMessage = "Image content was rejected. Please upload different images.";
                  }
                } catch (parseError) {
                  errorMessage = "Image content was rejected. Please upload different images.";
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
            } else if (errors?.cloudinary) {
              errorMessage = errors.cloudinary;
            }
          }
        }

        toast.error(errorMessage, {
          id: "upload",
          closeButton: true,
          duration: 5000,
          description: "Please try again or contact support if the issue persists",
        });

        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [navigate, queryClient]
  );

  return { isUploading, sellArtwork };
};

export default useSellArtwork;
