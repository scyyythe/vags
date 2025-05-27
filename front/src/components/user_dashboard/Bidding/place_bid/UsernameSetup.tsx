import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface UsernameSetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUsernameSet: (username: string) => void;
}

const UsernameSetupPopup: React.FC<UsernameSetupPopupProps> = ({
  isOpen,
  onClose,
  onUsernameSet,
}) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onUsernameSet(username.trim());
      toast.success("Username set successfully!");
      setIsLoading(false);
      onClose();
      setUsername("");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xs mx-4 relative" onClick={(e) => e.stopPropagation()}>
        <div className="py-6 px-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold">Set Up Your Username</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-black">
              <X size={17} />
            </button>
          </div>

          <p className="text-gray-500 text-[10px] mb-6">
            Choose a unique username that will represent you in the auction.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px]">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-full text-[10px] focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                3-20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
                  isLoading || !username.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-800 hover:bg-red-700"
                }`}
              >
                {isLoading ? "Setting..." : "Set Username"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetupPopup;
