import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface SystemMessageProps {
  type: "info" | "success" | "error";
  message: string;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ type, message }) => {
  const getIcon = () => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-md text-sm";
    
    switch (type) {
      case "info":
        return cn(baseStyles, "bg-blue-50 text-blue-700");
      case "success":
        return cn(baseStyles, "bg-green-50 text-green-700");
      case "error":
        return cn(baseStyles, "bg-red-50 text-red-700");
    }
  };

  return (
    <div className={getStyles()}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default SystemMessage;