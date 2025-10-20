// Simple obfuscation key (in production, this should be more complex)
const OBFUSCATION_KEY = "vags_secure_2024";

// Simple obfuscation function (not real encryption, but adds a layer of obfuscation)
const obfuscate = (text: string): string => {
  return btoa(text + OBFUSCATION_KEY);
};

const deobfuscate = (obfuscated: string): string => {
  try {
    const decoded = atob(obfuscated);
    return decoded.replace(OBFUSCATION_KEY, "");
  } catch {
    return "";
  }
};

// Secure token storage - relies on backend for expiration validation
export const secureTokenStorage = {
  // Store access token (backend handles expiration)
  setAccessToken: (token: string): void => {
    if (!token || token.trim() === "") {
      console.warn("Attempted to store empty token");
      return;
    }

    const obfuscated = obfuscate(token);
    localStorage.setItem("access_token", obfuscated);
  },

  // Store refresh token
  setRefreshToken: (token: string): void => {
    if (!token || token.trim() === "") {
      console.warn("Attempted to store empty refresh token");
      return;
    }

    const obfuscated = obfuscate(token);
    localStorage.setItem("refresh_token", obfuscated);
  },

  // Get access token
  getAccessToken: (): string | null => {
    const obfuscated = localStorage.getItem("access_token");
    if (!obfuscated) return null;

    const token = deobfuscate(obfuscated);
    return token || null;
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    const obfuscated = localStorage.getItem("refresh_token");
    if (!obfuscated) return null;

    const token = deobfuscate(obfuscated);
    return token || null;
  },

  // Clear all tokens
  clearTokens: (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  // Check if tokens exist (backend will validate expiration)
  hasValidTokens: (): boolean => {
    return !!(secureTokenStorage.getAccessToken() && secureTokenStorage.getRefreshToken());
  },
};

// Automatic token cleanup on app start
export const initializeTokenCleanup = (): void => {
  // Clean up expired tokens on app initialization
  if (!secureTokenStorage.hasValidTokens()) {
    secureTokenStorage.clearTokens();
  }

  // Set up periodic cleanup (every 5 minutes)
  setInterval(() => {
    if (!secureTokenStorage.hasValidTokens()) {
      secureTokenStorage.clearTokens();
    }
  }, 5 * 60 * 1000);
};
