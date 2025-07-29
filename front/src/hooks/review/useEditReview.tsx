import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { uploadToCloudinary } from "./useSubmitReview";

type EditReviewPayload = {
  review_id: string;
  rating: number;
  comment?: string;
  photos?: (string | File)[];
};

export const useEditReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ review_id, rating, comment = "", photos = [] }: EditReviewPayload) => {
      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        if (typeof photo === "string" && photo.startsWith("http")) {
          uploadedUrls.push(photo);
        } else if (photo instanceof File) {
          const url = await uploadToCloudinary(photo);
          uploadedUrls.push(url);
        }
      }

      await apiClient.put(`/review/${review_id}/update/`, {
        rating,
        comment,
        photos: uploadedUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
    },
    onError: () => {
      toast.error("Failed to update review.");
    },
  });
};
