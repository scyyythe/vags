import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import useUserQuery from "./useUserQuery";

const useUserDetails = (id?: string) => {
  const location = useLocation();
  const { data: user, isLoading, error } = useUserQuery(id || "");

  const state = location.state || {};

  const createdAt = useMemo(() => {
    if (user?.created_at && typeof user.created_at === "string") {
      return new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [user?.created_at]);

  const username = state.username || user?.username || "Unknown Username";
  const email = state.email || user?.email || "No email provided";
  const firstName = state.firstName || user?.first_name || "Unknown";
  const lastName = state.lastName || user?.last_name || "User";
  const role = state.role || user?.role || "User";
  const profileImage = state.profileImage || "";

  return {
    id,
    username,
    email,
    firstName,
    lastName,
    role,
    profileImage,
    createdAt,
    isLoading,
    error,
  };
};

export default useUserDetails;
