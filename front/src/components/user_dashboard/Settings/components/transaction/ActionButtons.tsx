import React from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasChanges,
  onSave,
  onReset,
}) => {
  return (
    <div className="flex justify-end gap-2 py-4 border-t border-gray-200 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={!hasChanges}
        className="text-xs h-8 px-3"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        disabled={!hasChanges}
        className="text-xs h-8 px-3 bg-red-800 hover:bg-red-700"
      >
        Save changes
      </Button>
    </div>
  );
};

export default ActionButtons;
