// hooks/useBatchUsers.ts
import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
}

export const useBatchUsers = (userIds: string[]) => {
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds.length) return;
    setLoading(true);

    apiClient
      .get("/users/", { params: { ids: userIds } }) // expects ?ids[]=id1&ids[]=id2
      .then((res) => {
        const mapped = res.data.reduce((acc: Record<string, UserProfile>, user: UserProfile) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsers(mapped);
      })
      .catch((err) => console.error("❌ Failed to fetch batch users:", err))
      .finally(() => setLoading(false));
  }, [userIds]);

  return { users, loading };
};
