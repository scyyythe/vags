import { useEffect, useState } from "react";

interface PerformanceMetrics {
  activeQueries: number;
  networkRequests: number;
  memoryUsage: number;
  isSlowConnection: boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    activeQueries: 0,
    networkRequests: 0,
    memoryUsage: 0,
    isSlowConnection: false,
  });

  useEffect(() => {
    // Monitor network connection
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection) {
      const isSlowConnection = connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
      setMetrics((prev) => ({ ...prev, isSlowConnection }));
    }

    // Monitor memory usage (if available)
    if ("memory" in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        }));
      };

      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, []);

  // Adjust polling based on performance
  const getOptimalPollingInterval = (baseInterval: number) => {
    if (metrics.isSlowConnection) {
      return baseInterval * 3; // 3x slower on slow connections
    }
    if (metrics.memoryUsage > 0.8) {
      return baseInterval * 2; // 2x slower when memory is high
    }
    return baseInterval;
  };

  return {
    metrics,
    getOptimalPollingInterval,
    shouldReducePolling: metrics.isSlowConnection || metrics.memoryUsage > 0.8,
  };
};
