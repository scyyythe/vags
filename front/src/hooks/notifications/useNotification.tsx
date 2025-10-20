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
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    toast.error("Failed to fetch notifications");
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
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: (data) => {
      // Only poll if user is active
      if (!isActive) return false;

      // Ensure data is an array before calling .some()
      if (!Array.isArray(data)) {
        return 10000; // Default polling interval if data is not ready
      }

      // Poll more frequently if there are unread notifications
      const hasUnread = data.some((n) => !n.is_read);
      return hasUnread ? 5000 : 10000; // Poll every 5s if unread, 10s if all read
    },
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
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
