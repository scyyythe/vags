// hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
}

export const useUserProfile = (userId?: string) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    apiClient
      .get(`/user/${userId}/`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("❌ Failed to fetch user profile:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
};
