import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

interface SoftDeleteAccountData {
  action: "schedule_deletion" | "cancel_deletion";
}

const softDeleteAccount = async (userId: string, data: SoftDeleteAccountData) => {
  const response = await apiClient.patch(`/users/${userId}/soft-delete/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const useSoftDeleteAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: SoftDeleteAccountData }) => softDeleteAccount(userId, data),
    onSuccess: (data, variables) => {
      if (variables.data.action === "schedule_deletion") {
        toast.success("Account scheduled for deletion in 60 days.", { closeButton: true });

        // Clear all tokens and user data from localStorage
        localStorage.clear();

        // Navigate to home page
        navigate("/");

        // Show login modal
        setShowLoginModal(true);
      } else {
        toast.success("Account deletion cancelled. Account is now active!", { closeButton: true });

        // Invalidate user queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
        queryClient.invalidateQueries({ queryKey: ["userDetails", variables.userId] });
      }
    },
    onError: (error: any) => {
      console.error("❌ Soft delete error:", error.response?.data || error.message);

      if (error.response?.data?.error) {
        toast.error("Failed to update account status: " + error.response.data.error, { closeButton: true });
      } else {
        toast.error("Failed to update account status. Please try again.", { closeButton: true });
      }
    },
  });
};

export default useSoftDeleteAccount;
