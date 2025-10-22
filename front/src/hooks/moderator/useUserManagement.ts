import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type ModUser = {
  id: string;
  username: string;
  email: string;
  dateJoined: string;
  status: "active" | "warned" | "muted" | "suspended";
  reportCount: number;
  lastActive: string;
  avatar?: string;
  notes?: string;
};

export type UserManagementResponse = {
  users: ModUser[];
};

export type UserActionRequest = {
  action: "warn" | "mute" | "suspend" | "restore" | "update_notes";
  user_id: string;
  notes?: string;
};

export type UserActionResponse = {
  message: string;
  action: string;
  user_id: string;
};

const fetchUsers = async (): Promise<UserManagementResponse> => {
  const res = await apiClient.get("/moderator/users/");
  return res.data;
};

const performUserAction = async (data: UserActionRequest): Promise<UserActionResponse> => {
  const res = await apiClient.post("/moderator/users/action/", data);
  return res.data;
};

export default function useUserManagement() {
  return useQuery<UserManagementResponse, Error>({
    queryKey: ["userManagement"],
    queryFn: fetchUsers,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useUserAction() {
  const queryClient = useQueryClient();
  
  return useMutation<UserActionResponse, Error, UserActionRequest>({
    mutationFn: performUserAction,
    onSuccess: (data) => {
      // Invalidate and refetch user management data
      queryClient.invalidateQueries({ queryKey: ["userManagement"] });
      queryClient.invalidateQueries({ queryKey: ["moderatorOverview"] });
    },
  });
}
