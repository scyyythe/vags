import { useMemo } from "react";
import { useLocation } from "react-router-dom";
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

  const updatedAt = useMemo(() => {
    if (user?.updated_at && typeof user.updated_at === "string") {
      return new Date(user.updated_at).toLocaleDateString("en-US", {
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
  }, [user?.updated_at]);

  const username = state.username || user?.username || "Unknown Username";
  const email = state.email || user?.email || "No email provided";
  const firstName = state.firstName || user?.first_name || "Unknown";
  const lastName = state.lastName || user?.last_name || "User";
  const role = state.role || user?.role || "User";
  const userStatus = state.userStatus || user?.user_status || "Active";
  const profilePicture = state.profilePicture || user?.profile_picture || "";
  const gender = state.gender || user?.gender || "Unknown";
  const dateOfBirth = state.dateOfBirth || user?.date_of_birth || null;
  const bio = state.bio || user?.bio || "No bio available";
  const contactNumber = state.contactNumber || user?.contact_number || "No contact number";
  const address = state.address || user?.address || "No address provided";
  const password = user?.password || "No password available"; // Get password (this should be done carefully)

  return {
    id,
    username,
    email,
    firstName,
    lastName,
    role,
    userStatus,
    profilePicture,
    gender,
    dateOfBirth,
    bio,
    contactNumber,
    address,
    password, // Include password in the returned object (use carefully)
    createdAt,
    updatedAt,
    isLoading,
    error,
  };
};

export default useUserDetails;
