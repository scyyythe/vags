import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user_id: string;
}

export const getLoggedInUserId = (): string | null => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user_id;
  } catch (error) {
    console.error("Error decoding token", error);
    return null;
  }
};
