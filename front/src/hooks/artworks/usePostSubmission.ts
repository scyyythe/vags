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
  description?: string;
  selectedFile?: File | null;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validatePostData = (data: ValidationData): ValidationResult => {
  const { title, medium, artworkHeight, artworkWidth, category, description, selectedFile } = data;

  // Artwork title validation: more flexible - allows apostrophes and common punctuation
  const titleRegex = /^[A-Za-z0-9\s''''''.,!?\-()&]+$/;
  if (!title?.trim()) {
    return { isValid: false, errorMessage: "Please enter an artwork title" };
  }
  if (!titleRegex.test(title)) {
    // Check for specific invalid characters
    const invalidChars = title.match(/[^A-Za-z0-9\s''''''.,!?\-()&]/g);
    if (invalidChars) {
      const uniqueInvalidChars = [...new Set(invalidChars)];
      return {
        isValid: false,
        errorMessage: `Artwork title contains invalid characters: ${uniqueInvalidChars.join(', ')}. Only letters, numbers, spaces, and common punctuation (.,!?-'()&) are allowed`,
      };
    }
    return {
      isValid: false,
      errorMessage: "Artwork title contains invalid characters. Only letters, numbers, spaces, and common punctuation (.,!?-'()&) are allowed",
    };
  }

  // Medium validation: proper names starting with capital letters
  if (!medium?.trim()) {
    return { isValid: false, errorMessage: "Please enter the medium used (e.g., Oil on Canvas, Digital Art, Watercolor)" };
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
  
  if (!artworkHeight || !artworkWidth) {
    return { isValid: false, errorMessage: "Please enter both height and width dimensions" };
  }
  
  if (isNaN(heightNum) || isNaN(widthNum)) {
    return { 
      isValid: false, 
      errorMessage: `Invalid dimensions: Height "${artworkHeight}" and Width "${artworkWidth}" must be valid numbers` 
    };
  }
  
  if (heightNum <= 0) {
    return { 
      isValid: false, 
      errorMessage: `Height must be greater than 0. Current value: ${artworkHeight}cm` 
    };
  }
  
  if (widthNum <= 0) {
    return { 
      isValid: false, 
      errorMessage: `Width must be greater than 0. Current value: ${artworkWidth}cm` 
    };
  }
  
  if (heightNum > 1000) {
    return { 
      isValid: false, 
      errorMessage: `Height is too large: ${artworkHeight}cm. Maximum allowed: 1000cm` 
    };
  }
  
  if (widthNum > 1000) {
    return { 
      isValid: false, 
      errorMessage: `Width is too large: ${artworkWidth}cm. Maximum allowed: 1000cm` 
    };
  }

  if (!category) {
    return { isValid: false, errorMessage: "Please select an artwork style from the dropdown menu" };
  }

  // Description validation: optional but if provided, should not be empty
  if (description !== undefined && !description?.trim()) {
    return { isValid: false, errorMessage: "Description cannot be empty. Please add a description or leave it blank" };
  }

  if (!selectedFile) {
    return { isValid: false, errorMessage: "Please upload an artwork image file (JPG, PNG, etc.)" };
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
