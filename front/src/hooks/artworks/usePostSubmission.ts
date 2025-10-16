import apiClient from "../../utils/apiClient";
import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export interface PostSubmissionData {
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

  // Medium validation: more flexible - allows commas, hyphens, and spaces
  const mediumRegex = /^[A-Za-z\s,.-]+$/;
  if (!medium?.trim()) {
    return { isValid: false, errorMessage: "Please enter the medium used" };
  }
  if (!mediumRegex.test(medium)) {
    return {
      isValid: false,
      errorMessage: "Medium invalid - please use letters, spaces, commas, periods, and hyphens",
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

export const submitPost = async (data: PostSubmissionData, queryClient?: QueryClient): Promise<void> => {
  const formData = new FormData();
  formData.append("title", data.title.trim());
  formData.append("category", data.category);
  formData.append("medium", data.medium.trim());
  formData.append("art_status", data.artStatus);
  formData.append("size", data.size);
  formData.append("price", data.price.toString());
  formData.append("description", data.description.trim());
  formData.append("visibility", data.visibility);
  formData.append("images", data.selectedFile);

  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("You must be logged in to post artwork.");
  }

  try {
    const response = await apiClient.post("art/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    // Invalidate relevant queries to refresh data
    if (queryClient) {
      // Invalidate all artwork-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("artworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks"))
          );
        },
      });
    }

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errors = error.response?.data;
      console.error("Upload error:", errors);

      let errorMessage = "Upload failed";

      // Handle different error formats
      if (errors?.cloudinary) {
        // Direct cloudinary error
        errorMessage = errors.cloudinary;
      } else if (Array.isArray(errors) && errors.length > 0) {
        const firstError = errors[0];
        console.log("First error:", firstError, "Type:", typeof firstError);

        // Handle Cloudinary error format
        if (typeof firstError === "string" && firstError.includes("cloudinary")) {
          try {
            // Parse the nested error structure - handle double-encoded strings
            let parsedError = firstError;

            // Try to parse if it's a string representation of a dict
            if (firstError.startsWith("{'") && firstError.endsWith("'}")) {
              // Extract the inner error message
              const innerMatch = firstError.match(/ErrorDetail\(string="([^"]+)"/);
              if (innerMatch) {
                parsedError = innerMatch[1];
              }
            }

            // Look for specific error messages
            if (parsedError.includes("Image content was rejected")) {
              errorMessage = "Image content was rejected. Please upload a different image.";
            } else if (parsedError.includes("Upload failed")) {
              errorMessage = "Image upload failed. Please try again with a different image.";
            } else if (parsedError.includes("Inappropriate image content")) {
              errorMessage = "Image content was rejected. Please upload a different image.";
            } else {
              errorMessage = parsedError;
            }
          } catch (parseError) {
            errorMessage = "Image content was rejected. Please upload a different image.";
          }
        } else {
          errorMessage = firstError;
        }
      } else if (errors?.detail) {
        errorMessage = errors.detail;
      } else if (errors?.images?.length) {
        errorMessage = errors.images[0];
      } else if (errors?.error) {
        // Handle error object format
        if (Array.isArray(errors.error)) {
          errorMessage = errors.error[0];
        } else if (typeof errors.error === "string") {
          errorMessage = errors.error;
        }
      }

      console.log("Final error message:", errorMessage);
      throw new Error(errorMessage);
    } else {
      throw new Error("Unexpected error occurred");
    }
  }
};
