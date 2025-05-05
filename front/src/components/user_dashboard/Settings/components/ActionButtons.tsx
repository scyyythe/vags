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
    <div className="flex items-center justify-between mt-8">
      <Button
        className="bg-red-700 hover:bg-red-800 text-white px-6"
        disabled={!hasChanges}
        onClick={handleSave}
      >
        {saveText}
      </Button>
      <Button
        variant="outline"
        className="bg-red-50 text-red-500 border-0 hover:bg-red-100"
        disabled={!hasChanges}
        onClick={onReset}
      >
        {cancelText}
      </Button>
    </div>
  );
};

export default ActionButtons;
