import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getLoggedInUserId } from '@/auth/decode';

const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Simple effect that runs when notifications data changes
  useEffect(() => {
    if (!userId) return;

    // Get current notifications from cache
    const currentNotifications = queryClient.getQueryData<any[]>(['notifications', userId]) || [];
    const unreadCount = currentNotifications.filter(n => !n.is_read).length;
    
    // Show visual feedback if there are unread notifications
    if (unreadCount > 0) {
      setHasNewNotifications(true);
      // Reset after a short delay
      const timer = setTimeout(() => setHasNewNotifications(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setHasNewNotifications(false);
    }
  }, [queryClient, userId]);

  return {
    hasNewNotifications,
  };
};

export default useRealTimeNotifications;
