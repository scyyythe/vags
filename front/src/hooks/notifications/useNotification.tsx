import { useEffect, useState } from "react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { getLoggedInUserId } from "@/auth/decode";

interface Notification {
  id: number;
  avatar?: string;
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
  date: Date;
  artworkTitle?: string;
  artworkMessage?: string;
}

const useNotifications = () => {
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const userId = getLoggedInUserId();
  useEffect(() => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get("/notifications/");
        const notifications: Notification[] = response.data;
        setDisplayedNotifications(notifications);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        toast.error("Failed to fetch notifications");
      }
    };

    fetchNotifications();
  }, [userId]);

  const filterNotifications = () => {
    let filtered = [...displayedNotifications];

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          (n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.action && n.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.target && n.target.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (date) {
      filtered = filtered.filter((n) => {
        const notifDate = new Date(n.date);
        return (
          notifDate.getDate() === date.getDate() &&
          notifDate.getMonth() === date.getMonth() &&
          notifDate.getFullYear() === date.getFullYear()
        );
      });
    }

    setDisplayedNotifications(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterNotifications();
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsFilterOpen(false);

    if (selectedDate) {
      const filtered = displayedNotifications.filter((n) => {
        const notifDate = new Date(n.date);
        return (
          notifDate.getDate() === selectedDate.getDate() &&
          notifDate.getMonth() === selectedDate.getMonth() &&
          notifDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setDisplayedNotifications(filtered);
    } else {
      setDisplayedNotifications(displayedNotifications);
    }
  };

  const clearAllNotifications = () => {
    setDisplayedNotifications([]);
    toast.success("All notifications cleared");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDate(undefined);
    setDisplayedNotifications(displayedNotifications);
  };

  return {
    displayedNotifications,
    searchQuery,
    date,
    isFilterOpen,
    handleSearch,
    handleDateSelect,
    clearAllNotifications,
    resetFilters,
    setIsFilterOpen,
  };
};

export default useNotifications;
