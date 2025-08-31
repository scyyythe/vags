import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};
export const useMyExhibitCards = (
  { includeDeleted, includeHidden, includeArchived } = {
    includeDeleted: false,
    includeHidden: false,
    includeArchived: false,
  }
) => {
  return useQuery({
    queryKey: ["my-exhibit-cards", includeDeleted, includeHidden, includeArchived],
    queryFn: async () => {
      const response = await apiClient.get(`/exhibits/my/`, {
        params: {
          include_deleted: includeDeleted,
          include_hidden: includeHidden,
          include_archived: includeArchived,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
