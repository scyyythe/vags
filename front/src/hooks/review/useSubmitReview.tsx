import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

type ReviewPayload = {
  artwork_id: string;
  purchase_id: string;
  rating: number;
  comment?: string;
  photos?: (string | File)[];
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "user_artwork_uploads");
  formData.append("folder", "review_photos");

  const res = await fetch("https://api.cloudinary.com/v1_1/du5bwye4h/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      const { photos = [], ...rest } = payload;

      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        if (typeof photo === "string" && photo.startsWith("http")) {
          uploadedUrls.push(photo);
        } else if (photo instanceof File) {
          const url = await uploadToCloudinary(photo);
          uploadedUrls.push(url);
        }
      }

      const finalPayload = {
        artwork_id: rest.artwork_id,
        purchase_id: rest.purchase_id,
        rating: rest.rating,
        comment: rest.comment,
        photos: uploadedUrls,
      };

      console.log("Submitting review payload:", finalPayload);

      const response = await apiClient.post("/submit-review/", finalPayload);
      return response.data;
    },

    onSuccess: () => {
      // Invalidate all review and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("my-purchases") ||
              queryKey.includes("all-reviews-by-purchase") ||
              queryKey.includes("artwork-reviews") ||
              queryKey.includes("reviews") ||
              queryKey.includes("notifications") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sold-artworks") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("purchase-orders") ||
              queryKey.includes("purchase-order") ||
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
    },

    onError: (error: any) => {
      console.error("Review submission failed:", error.response?.data || error.message);
      toast.error("Failed to submit review.");
    },
  });
};
