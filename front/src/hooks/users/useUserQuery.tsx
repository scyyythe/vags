import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  user_status?: string;
  created_at?: string;
  updated_at?: string;
  profile_picture?: string;
  bio?: string;
  contact_number?: string;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  date_of_birth?: string;
  password: string;
}

const fetchUserById = async (id: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`user/${id}/`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      throw new Error("User not found");
    }
    throw new Error("Failed to fetch user details");
  }
};

const useUserQuery = (id: string) => {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
};

export default useUserQuery;
