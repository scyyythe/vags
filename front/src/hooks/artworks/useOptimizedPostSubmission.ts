/**
 * Optimized post submission with progress tracking and better error handling
 */
import { useState, useCallback } from "react";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "../../utils/apiClient";
import { compressImage, needsCompression, formatFileSize } from "../../utils/imageCompression";

export interface OptimizedPostData {
  title: string;
  category: string;
  medium: string;
  artStatus: string;
  size: string;
  price: number;
  description: string;
  visibility: string;
  selectedFile: File;
}

export interface ValidationData {
  title?: string;
  medium?: string;
  artworkHeight?: string;
  artworkWidth?: string;
  category?: string;
  selectedFile?: File | null;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Validation function (same as before but optimized)
export const validatePostData = (data: ValidationData): ValidationResult => {
  const { title, medium, artworkHeight, artworkWidth, category, selectedFile } = data;

  // Artwork title validation: more flexible - allows apostrophes and common punctuation
  const titleRegex = /^[A-Za-z0-9\s'.,!?-]+$/;
  if (!title?.trim()) {
    return { isValid: false, errorMessage: "Please enter an artwork title" };
  }
  if (!titleRegex.test(title)) {
    return {
      isValid: false,
      errorMessage: "Artwork title invalid - please use letters, numbers, spaces, and common punctuation",
    };
  }

  // Medium validation: proper names starting with capital letters
  if (!medium?.trim()) {
    return { isValid: false, errorMessage: "Please enter the medium used" };
  }
  
  // Check if medium starts with capital letter
  if (!/^[A-Z]/.test(medium.trim())) {
    return { isValid: false, errorMessage: "Medium must start with a capital letter (e.g., Oil on Canvas, Digital Art)" };
  }
  
  // Allow letters, spaces, commas, and hyphens for proper names
  const mediumRegex = /^[A-Za-z\s,.-]+$/;
  if (!mediumRegex.test(medium)) {
    return {
      isValid: false,
      errorMessage: "Medium must be proper name(s), start with a capital letter, letters only. Use commas or spaces to separate multiple mediums (e.g., Wood, Paint or Oil on Canvas)",
    };
  }

  // Dimensions validation: height & width numbers, reasonable range
  const heightNum = parseFloat(artworkHeight as string);
  const widthNum = parseFloat(artworkWidth as string);
  if (!artworkHeight || !artworkWidth || isNaN(heightNum) || isNaN(widthNum)) {
    return { isValid: false, errorMessage: "Please enter valid dimensions" };
  }
  if (heightNum <= 0 || widthNum <= 0 || heightNum > 1000 || widthNum > 1000) {
    return {
      isValid: false,
      errorMessage: "Dimensions are unrealistic - height and width must be positive numbers below 1000cm",
    };
  }

  if (!category) {
    return { isValid: false, errorMessage: "Please select an artwork style" };
  }

  if (!selectedFile) {
    return { isValid: false, errorMessage: "Please upload at least one artwork image" };
  }

  return { isValid: true };
};

export const useOptimizedPostSubmission = () => {
  const [isUploading, setIsUploading] = useState(false);

  const submitPost = useCallback(async (data: OptimizedPostData, queryClient?: QueryClient): Promise<void> => {
    setIsUploading(true);

    try {
      // Compress image if needed for faster upload
      let fileToUpload = data.selectedFile;
      if (needsCompression(data.selectedFile)) {
        toast.loading("Compressing image for faster upload...", { id: "compress" });
        const compressionResult = await compressImage(data.selectedFile, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          maxSizeKB: 1024, // 1MB target
        });

        fileToUpload = compressionResult.file;

        toast.success(
          `Image compressed: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(
            compressionResult.compressedSize
          )}`,
          { id: "compress", duration: 2000 }
        );
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("title", data.title.trim());
      formData.append("category", data.category);
      formData.append("medium", data.medium.trim());
      formData.append("art_status", data.artStatus);
      formData.append("size", data.size);
      formData.append("price", data.price.toString());
      formData.append("description", data.description.trim());
      formData.append("visibility", data.visibility);
      formData.append("images", fileToUpload);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You must be logged in to post artwork.");
      }

      // Upload with optimized timeout
      const response = await apiClient.post("art/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        // Reduced timeout for faster feedback
        timeout: 30000, // 30 seconds
        // Add upload progress tracking
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });

      // Invalidate queries
      if (queryClient) {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              (queryKey.includes("artworks") ||
                queryKey.includes("explore") ||
                queryKey.includes("feed") ||
                queryKey.includes("profile") ||
                queryKey.includes("user-artworks") ||
                queryKey.includes("popularArtworks") ||
                queryKey.includes("popular-artworks") ||
                queryKey.includes("popular-artworks-light") ||
                queryKey.includes("followedArtworks") ||
                queryKey.includes("followed-artworks") ||
                queryKey.includes("trending-artworks") ||
                queryKey.includes("top-artworks"))
            );
          },
        });
        
        // Force refetch of critical queries
        await queryClient.refetchQueries({ queryKey: ["artworks"] });
        await queryClient.refetchQueries({ queryKey: ["popularArtworks"] });
        await queryClient.refetchQueries({ queryKey: ["followedArtworks"] });
      }

      // Show success toast
      toast.success("Artwork posted successfully!", {
        duration: 3000,
        description: "Your artwork is now live on the platform",
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Upload error:", error);

      let errorMessage = "Upload failed";

      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Upload timeout. Please try again with a smaller image.";
        } else if (error.message.includes("size")) {
          errorMessage = "Image too large. Please use an image smaller than 20MB.";
        } else if (error.message.includes("rejected")) {
          errorMessage = "Image content was rejected. Please upload a different image.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
        description: "Please try again or contact support if the issue persists",
      });

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    submitPost,
    isUploading,
    validatePostData,
  };
};
