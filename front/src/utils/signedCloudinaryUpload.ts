/**
 * Signed Cloudinary upload utility with transformations support
 */
import apiClient from "./apiClient";

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
  transformation?: string;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Get signed upload parameters from backend
 */
export const getSignedUploadParams = async (folder: string = "artworks"): Promise<SignedUploadParams> => {
  try {
    const response = await apiClient.get(`/cloudinary/signature/`);
    return {
      ...response.data,
      folder, // Override folder if specified
    };
  } catch (error) {
    console.error("Failed to get signed upload parameters:", error);
    throw new Error("Failed to get upload permissions");
  }
};

/**
 * Upload file to Cloudinary using signed upload with transformations
 */
export const uploadToCloudinarySigned = async (
  file: File,
  folder: string = "artworks",
  transformations?: string
): Promise<UploadResult> => {
  try {
    // Get signed parameters
    const signedParams = await getSignedUploadParams(folder);

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", signedParams.timestamp.toString());
    formData.append("signature", signedParams.signature);
    formData.append("api_key", signedParams.api_key);
    formData.append("folder", folder);

    // Add transformations if provided
    if (transformations) {
      formData.append("transformation", transformations);
    }

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${signedParams.cloud_name}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorData}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Signed upload failed:", error);
    throw error;
  }
};

/**
 * Upload with automatic optimization transformations
 */
export const uploadWithOptimization = async (file: File, folder: string = "artworks"): Promise<UploadResult> => {
  // Define optimization transformations
  const transformations = "q_auto,f_auto,w_1920,h_1920,c_limit";

  return uploadToCloudinarySigned(file, folder, transformations);
};

/**
 * Upload multiple files concurrently with optimization
 */
export const uploadMultipleWithOptimization = async (
  files: File[],
  folder: string = "artworks"
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadWithOptimization(file, folder));

  return Promise.all(uploadPromises);
};
