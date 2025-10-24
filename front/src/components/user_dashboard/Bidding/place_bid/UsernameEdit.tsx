import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface UsernameEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUsernameUpdate: (newUsername: string) => void;
  currentUsername: string;
}

const UsernameEditPopup: React.FC<UsernameEditPopupProps> = ({
  isOpen,
  onClose,
  onUsernameUpdate,
  currentUsername,
}) => {
  const { language } = useLanguage();
  const [username, setUsername] = useState(currentUsername.replace('@', ''));
  const [isLoading, setIsLoading] = useState(false);

  // Translation hooks
  const editYourUsernameText = useAutoTranslation("Edit Your Username", language);
  const chooseUniqueUsernameText = useAutoTranslation("Choose a unique username that represents you.", language);
  const usernameText = useAutoTranslation("Username", language);
  const enterUsernameText = useAutoTranslation("Enter username", language);
  const usernameRequirementsText = useAutoTranslation("3-20 characters. Letters, numbers, and underscores only.", language);
  const updatingText = useAutoTranslation("Updating...", language);
  const updateUsernameText = useAutoTranslation("Update Username", language);
  const usernameCannotBeEmptyText = useAutoTranslation("Username cannot be empty", language);
  const usernameMinLengthText = useAutoTranslation("Username must be at least 3 characters long", language);
  const usernameMaxLengthText = useAutoTranslation("Username must be 20 characters or less", language);
  const usernameInvalidCharsText = useAutoTranslation("Username can only contain letters, numbers, and underscores", language);
  const usernameUpdatedSuccessText = useAutoTranslation("Username updated successfully!", language);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error(usernameCannotBeEmptyText, { closeButton: true })
      return;
    }

    if (username.length < 3) {
      toast.error(usernameMinLengthText, { closeButton: true })
      return;
    }

    if (username.length > 20) {
      toast.error(usernameMaxLengthText, { closeButton: true })
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error(usernameInvalidCharsText, { closeButton: true })
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onUsernameUpdate(username);
      toast.success(usernameUpdatedSuccessText, { closeButton: true })
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setUsername(currentUsername.replace('@', ''));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xs mx-4 relative" onClick={(e) => e.stopPropagation()}>
        <div className="py-11 px-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{editYourUsernameText}</h2>
            <button onClick={handleClose} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              <X size={17} />
            </button>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-[10px] mb-6">
            {chooseUniqueUsernameText}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {usernameText}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-[10px]">@</span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-[10px] focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder={enterUsernameText}
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                {usernameRequirementsText}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              {/* <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button> */}
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
                  isLoading || !username.trim() 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-red-800 hover:bg-red-700"
                }`}
              >
                {isLoading ? updatingText : updateUsernameText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernameEditPopup;
