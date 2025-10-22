import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { User } from "@/hooks/users/useUserQuery";
import { toast } from "sonner";

interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "moderator" | "user";
  username?: string;
  gender?: "Male" | "Female" | "Other";
  bio?: string;
  contact_number?: string;
  address?: string;
}

const createUser = async (data: CreateUserPayload): Promise<User> => {
  try {
    const response = await apiClient.post<{ user: User }>("/admin/users/create/", data);
    return response.data.user;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string; message?: string; details?: any };
    
    // Handle specific error cases
    if (errorData?.error === 'Email already exists') {
      throw new Error(errorData.message || 'This email is already registered in the system.');
    }
    
    throw new Error(errorData?.error || errorData?.message || "Failed to create user");
  }
};

const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Update the all-users query with the new user
      queryClient.setQueryData<User[]>(["all-users"], (oldUsers = []) => [
        ...oldUsers,
        newUser
      ]);

      toast.success("User created successfully");
    },
    onError: (error) => {
      console.error("Error creating user:", error.message);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export default useCreateUserMutation;
