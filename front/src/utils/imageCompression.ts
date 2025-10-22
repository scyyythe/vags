/**
 * Client-side image compression utility
 * Reduces file sizes before upload to improve performance
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress an image file to reduce upload time
 */
export const compressImage = async (file: File, options: CompressionOptions = {}): Promise<CompressionResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeKB = 2048, // 2MB
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          // Check if we need further compression
          const sizeKB = blob.size / 1024;

          if (sizeKB > maxSizeKB) {
            // Further compress if still too large
            const newQuality = Math.max(0.1, quality * (maxSizeKB / sizeKB));
            canvas.toBlob(
              (finalBlob) => {
                if (!finalBlob) {
                  reject(new Error("Failed to compress image to target size"));
                  return;
                }

                const compressedFile = new File([finalBlob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });

                resolve({
                  file: compressedFile,
                  originalSize: file.size,
                  compressedSize: finalBlob.size,
                  compressionRatio: finalBlob.size / file.size,
                });
              },
              file.type,
              newQuality
            );
          } else {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: blob.size / file.size,
            });
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress multiple images in parallel
 */
export const compressImages = async (files: File[], options: CompressionOptions = {}): Promise<CompressionResult[]> => {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Check if a file needs compression
 */
export const needsCompression = (file: File, maxSizeKB: number = 2048): boolean => {
  return file.size / 1024 > maxSizeKB;
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
