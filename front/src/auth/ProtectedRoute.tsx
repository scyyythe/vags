import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const accessToken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();

  useEffect(() => {
    if (!accessToken) {
      setShowLoginModal(true);
      navigate("/", { replace: true });
    }
  }, [accessToken, setShowLoginModal, navigate]);

  if (!accessToken) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
