import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ModalContextProps {
  showForgotPasswordModal: boolean;
  setShowForgotPasswordModal: (show: boolean) => void;
  showRegisterModal: boolean;
  setShowRegisterModal: (show: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); 
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  return (
    <ModalContext.Provider value={{
      showForgotPasswordModal,
      setShowForgotPasswordModal,
      showRegisterModal,
      setShowRegisterModal,
      showLoginModal,
      setShowLoginModal
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
