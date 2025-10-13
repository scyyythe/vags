import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface DeactivateAccountData {
  user_status: string;
  deactivated_at?: string;
}

const deactivateAccount = async (userId: string, data: DeactivateAccountData) => {
  const response = await apiClient.patch(`/users/${userId}/deactivate/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const useDeactivateAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: DeactivateAccountData }) => deactivateAccount(userId, data),
    onSuccess: (data, variables) => {
      if (variables.data.user_status === "deactivated") {
        toast.success("Your account has been deactivated successfully.", { closeButton: true });

        // Clear all tokens and user data from localStorage
        localStorage.clear();

        // Navigate to home page
        navigate("/");

        // Show login modal
        setShowLoginModal(true);
      } else {
        // Invalidate user-related queries for reactivation
        queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
        queryClient.invalidateQueries({ queryKey: ["userDetails", variables.userId] });
      }

      // Clear user session data
      queryClient.removeQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      console.error("❌ Deactivation error:", error.response?.data || error.message);

      if (error.response?.data?.error) {
        toast.error("Failed to update account status: " + error.response.data.error, { closeButton: true });
      } else {
        toast.error("Failed to update account status. Please try again.", { closeButton: true });
      }
    },
  });
};

export default useDeactivateAccount;
