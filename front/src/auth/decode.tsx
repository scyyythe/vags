import { jwtDecode } from "jwt-decode";
import { secureTokenStorage } from "@/utils/security/secureStorage";

interface DecodedToken {
  user_id: string;
}

// Get token using secure storage (backend handles expiration)
export const getValidToken = (): string | null => {
  return secureTokenStorage.getAccessToken();
};

export const getLoggedInUserId = (): string | null => {
  const token = getValidToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user_id;
  } catch (error) {
    console.error("Error decoding token", error);
    // Clear invalid token using secure storage
    secureTokenStorage.clearTokens();
    return null;
  }
};
