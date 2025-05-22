import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { User } from "./useUserQuery";

const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>("/users/");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { detail?: string })?.detail || "Failed to fetch users");
  }
};

const useAllUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: ["all-users"],
    queryFn: fetchAllUsers,
  });
};

export default useAllUsersQuery;
