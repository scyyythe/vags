import React from "react";
import useAccountStatus from "@/hooks/useAccountStatus";

interface ActiveAccountOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders its children if the user's account is active
 * Shows fallback content (or nothing) if account is deactivated
 */
const ActiveAccountOnly: React.FC<ActiveAccountOnlyProps> = ({ children, fallback = null }) => {
  const { isActive, isLoading } = useAccountStatus();

  // Show loading state or fallback while checking account status
  if (isLoading || !isActive) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ActiveAccountOnly;
