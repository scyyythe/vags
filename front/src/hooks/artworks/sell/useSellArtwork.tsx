import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { compressImage, needsCompression, formatFileSize } from "@/utils/imageCompression";

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
        // Prepare all images for parallel compression
        const imagesToCompress = [];
        const imageIndexMap = new Map();
        
        // Add main image
        if (mainImage) {
          imagesToCompress.push({
            file: mainImage,
            type: 'main',
            index: 0
          });
          imageIndexMap.set(0, 'main');
        }
        
        // Add additional images
        additionalImages.forEach((img, index) => {
          if (img) {
            imagesToCompress.push({
              file: img,
              type: 'additional',
              index: index + 1
            });
            imageIndexMap.set(index + 1, 'additional');
          }
        });

        // Show compression progress
        if (imagesToCompress.some(img => needsCompression(img.file))) {
          toast.loading("Compressing images...", { id: "compress-all" });
        }

        // Compress all images in parallel
        const compressionPromises = imagesToCompress.map(async (imgData) => {
          if (needsCompression(imgData.file)) {
            const result = await compressImage(imgData.file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.8,
              maxSizeKB: 1024,
            });
            return { ...imgData, compressedFile: result.file, result };
          }
          return { ...imgData, compressedFile: imgData.file };
        });

        const compressionResults = await Promise.all(compressionPromises);
        
        // Separate main and additional images
        let compressedMainImage = mainImage;
        const compressedAdditionalImages = [];
        
        compressionResults.forEach((result) => {
          if (result.type === 'main') {
            compressedMainImage = result.compressedFile;
          } else {
            compressedAdditionalImages.push(result.compressedFile);
          }
        });

        // Show compression success
        const compressedCount = compressionResults.filter(r => r.result).length;
        if (compressedCount > 0) {
          toast.success(
            `Compressed ${compressedCount} image${compressedCount > 1 ? 's' : ''}`,
            { id: "compress-all", duration: 2000 }
          );
        }

        // Pre-calculate values to avoid repeated operations
        const currentYear = new Date().getFullYear().toString();
        const trimmedTitle = title.trim();
        const trimmedMedium = medium?.trim() || "Mixed Media";
        const trimmedDescription = description?.trim() || "Beautiful artwork";
        const roundedPrice = Math.round(priceNum).toString();
        const sizeString = `${height || "Unknown"}x${width || "Unknown"}`;
        
        // Calculate quantity based on edition type
        let quantityValue = "1";
        if (edition === "Open Edition" || edition === "Limited Edition") {
          const qty = quantity && !isNaN(parseInt(quantity)) ? parseInt(quantity) : 1;
          quantityValue = qty.toString();
        }

        // Create FormData more efficiently
        const formData = new FormData();
        formData.append("title", trimmedTitle);
        formData.append("year_created", year_created?.slice(0, 10) || currentYear);
        formData.append("category", style || "General");
        formData.append("medium", trimmedMedium);
        formData.append("size", sizeString);
        formData.append("description", trimmedDescription);
        formData.append("price", roundedPrice);
        formData.append("edition", edition || "Original (1 of 1)");
        formData.append("quantity", quantityValue);
        formData.append("visibility", "Public");
        formData.append("art_status", "onSale");

        // Add main image
        formData.append("images", compressedMainImage);

        // Add additional images in batch
        compressedAdditionalImages.forEach((img) => {
          if (img) formData.append("images", img);
        });

        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("You must be logged in to list artwork.");
        }

        // Update toast to show upload progress
        toast.loading("Uploading artwork...", { id: "upload" });

        // Upload with optimized timeout and progress tracking
        const response = await apiClient.post("/art/sell/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, // 30 seconds
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              toast.loading(`Uploading artwork... ${percentCompleted}%`, { id: "upload" });
            }
          },
        });

        // Invalidate all marketplace and related queries for real-time updates
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              (queryKey.includes("marketplace-art-cards") ||
                queryKey.includes("trending-artworks") ||
                queryKey.includes("followedArtworks") ||
                queryKey.includes("my-sell-art-cards") ||
                queryKey.includes("artworks") ||
                queryKey.includes("popular-artworks") ||
                queryKey.includes("popularArtworks") ||
                queryKey.includes("popular-artworks-light") ||
                queryKey.includes("top-artworks") ||
                queryKey.includes("top-sellers") ||
                queryKey.includes("explore") ||
                queryKey.includes("feed") ||
                queryKey.includes("profile") ||
                queryKey.includes("user-artworks") ||
                queryKey.includes("notifications") ||
                queryKey.includes("exhibits") ||
                queryKey.includes("exhibit-cards") ||
                queryKey.includes("my-exhibit-cards") ||
                queryKey.includes("auctions") ||
                queryKey.includes("biddingArtworks") ||
                queryKey.includes("followedAuctions") ||
                queryKey.includes("myAuctionArtworks"))
            );
          },
        });

        // Trigger immediate background refetch for real-time updates
        // This will refetch in background without blocking the UI
        queryClient.refetchQueries({
          queryKey: ["marketplace-art-cards"],
        });

        queryClient.refetchQueries({
          queryKey: ["trending-artworks"],
        });

        queryClient.refetchQueries({
          queryKey: ["artworks"],
        });

        // Also trigger cross-tab updates
        localStorage.setItem('new-artwork-uploaded', Date.now().toString());
        window.dispatchEvent(new CustomEvent('new-artwork-uploaded'));

        // Additional aggressive refetch after a short delay to catch any backend processing
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: ["marketplace-art-cards"],
          });
          queryClient.refetchQueries({
            queryKey: ["trending-artworks"],
          });
        }, 2000); // Refetch after 2 seconds to catch backend processing

        // Reset uploading state before showing success message
        setIsUploading(false);

        // Show success toast after all operations are complete
        toast.success("Artwork listed successfully!", {
          id: "upload",
          closeButton: true,
          duration: 3000,
          description: "Your artwork is now available in the marketplace",
        });

        // Navigate to marketplace after cache invalidation is complete
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
        // Reset uploading state
        setIsUploading(false);
      }
    },
    [navigate, queryClient]
  );

  return { isUploading, sellArtwork };
};

export default useSellArtwork;
