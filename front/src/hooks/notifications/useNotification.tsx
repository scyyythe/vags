import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { getLoggedInUserId } from "@/auth/decode";
import useUserActivity from "@/hooks/useUserActivity";

interface User {
  id: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  user_status?: string;
  created_at?: string;
  updated_at?: string;
  profile_picture?: string;
  cover_photo?: string;
  bio?: string;
  contact_number?: string;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  date_of_birth?: string;
  password: string;
}
interface Notification {
  id: number;
  user: User;
  avatar?: string;
  actor: User;
  created_at?: string;
  name?: string;
  action: string;
  target?: string;
  time: string;
  check?: boolean;
  money?: boolean;
  icon?: string;
  amount?: string;
  forAmount?: string;
  token?: string;
  link?: string;
  donation?: string;
  date: string;
  artworkTitle?: string;
  message?: string;
  is_read?: boolean;
}
// Fetch function for notifications
const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get("/notifications/");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch notifications", error);

    // Provide specific error messages based on error type
    let errorMessage = "Failed to fetch notifications";

    if (error?.response?.status === 401) {
      errorMessage = "Authentication required. Please log in again.";
    } else if (error?.response?.status === 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (error?.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please check your connection.";
    } else if (error?.message?.includes("Network Error")) {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (error?.response?.status === 404) {
      errorMessage = "Notifications not found.";
    }

    // Only show toast for non-retryable errors
    if (error?.response?.status !== 500 && error?.code !== "ECONNABORTED") {
      toast.error(errorMessage);
    }

    throw error;
  }
};

const useNotifications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const userId = getLoggedInUserId();
  const queryClient = useQueryClient();
  const { isActive } = useUserActivity();

  // Use React Query to fetch notifications with smart polling
  const {
    data: allNotifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Notification[], Error>({
    queryKey: ["notifications", userId],
    queryFn: fetchNotifications,
    enabled: !!userId, // Only fetch if user is authenticated
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Filter notifications based on search and date
  const displayedNotifications = allNotifications.filter((n) => {
    let matches = true;

    if (searchQuery) {
      matches =
        matches &&
        ((n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.action && n.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.target && n.target.toLowerCase().includes(searchQuery.toLowerCase())));
    }

    if (date && n.date) {
      const notifDate = new Date(n.date);
      matches =
        matches &&
        notifDate.getDate() === date.getDate() &&
        notifDate.getMonth() === date.getMonth() &&
        notifDate.getFullYear() === date.getFullYear();
    }

    return matches;
  });

  // Calculate unread notifications count
  const unreadCount = allNotifications.filter((n) => !n.is_read).length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsFilterOpen(false);
  };

  const clearAllNotifications = () => {
    // Invalidate the notifications query to trigger a refetch with empty data
    queryClient.invalidateQueries({
      queryKey: ["notifications", userId],
    });
    toast.success("All notifications cleared");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDate(undefined);
  };

  return {
    displayedNotifications,
    unreadCount,
    searchQuery,
    date,
    isFilterOpen,
    isLoading,
    error,
    handleSearch,
    handleDateSelect,
    clearAllNotifications,
    resetFilters,
    setIsFilterOpen,
    refetch, // Expose refetch for manual refresh if needed
  };
};

export default useNotifications;
