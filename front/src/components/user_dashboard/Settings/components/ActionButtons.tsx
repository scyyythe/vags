import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ActionButtonsProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  saveText?: string;
  cancelText?: string;
}

const ActionButtons = ({
  hasChanges,
  onSave,
  onReset,
  saveText = "Update Settings",
  cancelText = "Reset"
}: ActionButtonsProps) => {
  const { toast } = useToast();
  
  const handleSave = () => {
    onSave();
    toast({
      title: "Settings updated",
      description: "Your settings have been successfully updated.",
    });
  };

  return (
    <div className="flex text-[10px] items-center justify-between mt-8 ">
      <button
        className="bg-red-800 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-full cursor-pointer"
        disabled={!hasChanges}
        onClick={handleSave}
      >
        {saveText}
      </button>
      <button
        className="bg-red-50 text-red-500 font-medium border-0 hover:bg-red-100 px-6 py-2 rounded-full cursor-pointer"
        disabled={!hasChanges}
        onClick={onReset}
      >
        {cancelText}
      </button>
    </div>
  );
};

export default ActionButtons;
