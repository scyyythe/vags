import { useState, useCallback } from "react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
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

interface ValidationData {
  title: string;
  mainImage: File | null;
  price: string;
  medium: string;
  height: string;
  width: string;
  description: string;
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export const validateSellData = (data: ValidationData): ValidationResult => {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push("Artwork title is required");
  }

  if (!data.mainImage) {
    errors.push("Artwork image is required");
  }

  if (!data.price || parseFloat(data.price) <= 0) {
    errors.push("Valid price is required");
  }

  if (!data.medium.trim()) {
    errors.push("Medium is required");
  }

  if (!data.height || !data.width) {
    errors.push("Artwork dimensions are required");
  }

  if (!data.description.trim()) {
    errors.push("Description is required");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

export const useOptimizedSellArtwork = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sellArtwork = useCallback(
    async (data: OptimizedSellData, queryClient?: QueryClient): Promise<void> => {
      // Validate data first
      const validation = validateSellData(data);
      if (!validation.isValid) {
        toast.error(validation.errors![0]);
        return;
      }

      setIsUploading(true);
      toast.loading("Listing artwork...", { id: "sell-upload" });

      try {
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

        // Prepare form data
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("year_created", year_created.slice(0, 10));
        formData.append("category", style);
        formData.append("medium", medium.trim());
        formData.append("size", `${height}x${width}`);
        formData.append("description", description.trim());
        formData.append("price", price);
        formData.append("edition", edition);
        formData.append("quantity", quantity);
        formData.append("images", mainImage);
        formData.append("visibility", "Public");
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

        // Invalidate queries for immediate marketplace updates
        if (queryClient) {
          await Promise.all([
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
          ]);

          // Force refetch marketplace data immediately
          await queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
        }

        // Show success toast
        toast.success("Artwork listed successfully!", {
          id: "sell-upload",
          closeButton: true,
          duration: 3000,
          description: "Your artwork is now available in the marketplace",
        });

        // Navigate to marketplace
        navigate("/marketplace");

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
          const apiError = error as { response?: { data?: any } };
          const errors = apiError.response?.data;

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
          id: "sell-upload",
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

  return {
    sellArtwork,
    isUploading,
    validateSellData,
  };
};
