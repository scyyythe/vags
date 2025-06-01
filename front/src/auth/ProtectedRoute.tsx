import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: JSX.Element;
}

const ProtectedRoute = ({ allowedRoles = ["user"], children }: ProtectedRouteProps) => {
  const accessToken = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setShowLoginModal(true);
      navigate("/", { replace: true });
      setIsAllowed(false);
      return;
    }

    const normalizedRole = (userRole || "user").toLowerCase();
    const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());

    if (!normalizedAllowed.includes(normalizedRole)) {
      navigate("/unauthorized", {
        replace: true,
        state: { code: 401, message: "You are Unauthorized. Please login to access this page." },
      });
      setIsAllowed(false);
    } else {
      setIsAllowed(true);
    }
  }, [accessToken, userRole, allowedRoles, navigate, setShowLoginModal]);

  if (isAllowed === null) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
