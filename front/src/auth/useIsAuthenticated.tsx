import { getValidToken } from "./decode";

export const useIsAuthenticated = (): boolean => {
  const accessToken = getValidToken();
  return !!accessToken;
};
