import { useEffect, useRef } from "react";

export type PollingPriority = "high" | "medium" | "low";

interface SmartPollingConfig {
  priority: PollingPriority;
  enabled: boolean;
  onPoll: () => void;
}

const POLLING_INTERVALS = {
  high: 3000, // 3 seconds - for critical data (notifications, purchases)
  medium: 10000, // 10 seconds - for important data (artworks, auctions)
  low: 30000, // 30 seconds - for less critical data (reports, user status)
};

export const useSmartPolling = ({ priority, enabled, onPoll }: SmartPollingConfig) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const interval = POLLING_INTERVALS[priority];
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current && document.visibilityState === "visible") {
          onPoll();
        }
      }, interval);
    };

    // Start polling immediately
    startPolling();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        // Refetch immediately when tab becomes visible
        onPoll();
        startPolling();
      } else {
        // Stop polling when tab is hidden
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      isActiveRef.current = false;
    };
  }, [priority, enabled, onPoll]);

  return {
    isPolling: enabled && intervalRef.current !== null,
    priority,
  };
};

// Hook for conditional polling based on user activity
export const useActivityBasedPolling = (
  config: SmartPollingConfig & {
    userActive: boolean;
    lastActivity: number;
  }
) => {
  const { userActive, lastActivity, ...pollingConfig } = config;

  // Only poll if user is active or recently active (within 5 minutes)
  const shouldPoll = userActive || Date.now() - lastActivity < 5 * 60 * 1000;

  return useSmartPolling({
    ...pollingConfig,
    enabled: shouldPoll && pollingConfig.enabled,
  });
};
