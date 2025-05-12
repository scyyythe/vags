import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: string;
  user_status: string;
  gender: string;
  date_of_birth: string;
  profile_picture: File;
  bio: string;
  contact_number: string;
  address: string;
}

interface UserDetails {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  password?: string;
  user_status?: string;
  gender?: string;
  date_of_birth?: string;
  profile_picture?: File;
  bio?: string;
  contact_number?: string;
  address?: string;
}
const updateUserDetails = async ([userId, data]: [string, FormData]): Promise<User> => {
  const response = await apiClient.patch(`/users/${userId}/update/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const useUpdateUserDetails = () => {
  return useMutation<User, Error, [string, FormData]>({
    mutationFn: updateUserDetails,
    onSuccess: (data) => {
      toast.success("User details updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update user details.");
      console.error(error);
    },
  });
};

export default useUpdateUserDetails;
