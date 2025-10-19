import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/context/ModalContext";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  const logout = () => {
    try {
      // Clear all React Query cache
      queryClient.clear();

      // Invalidate and remove specific query keys that might contain user-specific data
      const queryKeysToInvalidate = [
        ["user"],
        ["artworks"],
        ["transactions"],
        ["purchases"],
        ["conversations"],
        ["notifications"],
        ["my-purchases"],
        ["my-sold-artworks"],
        ["transaction-by-artwork"],
        ["user-conversations"],
        ["user-details"],
        ["user-profile"],
        ["artwork-details"],
        ["exhibits"],
        ["auctions"],
        ["bidding"],
        ["chat"],
        ["messages"],
        ["reviews"],
        ["favorites"],
        ["followers"],
        ["following"],
      ];

      queryKeysToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
        queryClient.removeQueries({ queryKey });
      });

      // Clear localStorage but preserve language setting
      const savedLanguage = localStorage.getItem("language");
      localStorage.clear();
      if (savedLanguage) {
        localStorage.setItem("language", savedLanguage);
      }

      // Clear sessionStorage as well (if used)
      sessionStorage.clear();

      // Clear any cookies (if used)
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Navigate immediately without delay to prevent hooks issues
      navigate("/", { replace: true });
      setShowLoginModal(true);

      // Note: Removed window.location.reload() to prevent hooks issues
      // The cache clearing and navigation should be sufficient
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback: just clear storage and navigate but preserve language
      const savedLanguage = localStorage.getItem("language");
      localStorage.clear();
      if (savedLanguage) {
        localStorage.setItem("language", savedLanguage);
      }
      sessionStorage.clear();
      navigate("/", { replace: true });
      setShowLoginModal(true);
    }
  };

  return { logout };
};

export default useLogout;
