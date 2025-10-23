import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export const useExhibitCards = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Cancel any ongoing request when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return useQuery({
    queryKey: ["exhibit-cards"],
    queryFn: async () => {
      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        const response = await apiClient.get("/exhibits/cards/", {
          signal: abortControllerRef.current.signal,
          timeout: 30000, // 30 second timeout
        });
        devLog("Exhibit Cards Response:", response.data);
        return response.data;
      } catch (error: any) {
        // Don't show toast for aborted requests
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          console.log("Exhibit cards request was cancelled");
          throw error;
        }
        
        toast.error("Failed to load exhibit cards.");
        console.error("Error fetching exhibit cards:", error);
        throw new Error(error?.response?.data?.detail || error.message || "Error fetching exhibit cards");
      }
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      // Don't retry if request was aborted
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return false;
      }
      return failureCount < 2;
    },
  });
};
