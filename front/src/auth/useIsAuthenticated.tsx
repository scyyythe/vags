
export const useIsAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem("access_token");


  return !!accessToken;
};
