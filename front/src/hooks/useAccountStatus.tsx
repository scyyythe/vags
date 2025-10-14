import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";

/**
 * Hook to check if the current user's account is deactivated
 * This can be used to conditionally render content based on account status
 */
export const useAccountStatus = () => {
  const userId = getLoggedInUserId();
  const { userStatus, isLoading } = useUserDetails(userId);

  const isDeactivated = userStatus?.toLowerCase() === "deactivated";
  const isActive = userStatus?.toLowerCase() === "active";

  return {
    userStatus,
    isDeactivated,
    isActive,
    isLoading,
  };
};

export default useAccountStatus;
