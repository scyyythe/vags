import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface Social {
  id: string;
  platform: string;
  url: string;
  added_at: string;
}

// Fetch socials
const fetchSocials = async (userId: string): Promise<Social[]> => {
  const { data } = await apiClient.get(`/users/${userId}/socials/`);
  return data.map((social: any) => ({
    id: social.id || social._id,
    platform: social.platform,
    url: social.url,
    added_at: social.added_at,
  }));
};

export const useSocials = (userId: string) => {
  return useQuery<Social[]>({
    queryKey: ["socials", userId],
    queryFn: () => fetchSocials(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};

// Add a social
export const useAddSocial = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSocial: { platform: string; url: string }) => {
      const { data } = await apiClient.post(`/users/${userId}/socials/`, newSocial);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socials", userId] });
    },
  });
};

// Delete a social
export const useDeleteSocial = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (socialId: string) => {
      await apiClient.delete(`/socials/${socialId}/delete/`);
      return socialId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socials", userId] });
    },
  });
};
