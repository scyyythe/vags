import React, { useState } from "react";
import { X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";
import { getLoggedInUserId } from "@/auth/decode";
import useUserQuery from "@/hooks/users/useUserQuery";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type Identity = "anonymous" | "username" | "fullName";

interface IdentitySelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIdentity: Identity) => void;
  username?: string;
}

const IdentitySelectionPopup: React.FC<IdentitySelectionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username = "",
}) => {
  const { language } = useLanguage();
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  const { mutate: updateUser } = useUpdateUserDetails();
  const id = getLoggedInUserId();
  const { data: user, refetch } = useUserQuery(id);

  const currentUsername = user?.username ? `@${user.username}` : "";
  const hasUsername = !!user?.username;

  const navigate = useNavigate();

  // Translation hooks - Main UI
  const placeYourBidText = useAutoTranslation("Place Your Bid", language);
  const chooseNameText = useAutoTranslation("Choose how you want your name to appear on this bid.", language);
  const useMyUsernameText = useAutoTranslation("Use My Username", language);
  const editText = useAutoTranslation("Edit", language);
  const setUpUsernameText = useAutoTranslation("Set up username first", language);
  const bidAnonymouslyText = useAutoTranslation("Bid Anonymously", language);
  const learnMoreText = useAutoTranslation("Learn more about bid privacy and security", language);
  const privacyInfoText = useAutoTranslation("Privacy information displayed", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const confirmText = useAutoTranslation("Confirm", language);
  const setUsernameText = useAutoTranslation("Set Username", language);

  // Translation hooks - Username Setup Form
  const usernameText = useAutoTranslation("Username", language);
  const enterUsernameText = useAutoTranslation("Enter username", language);
  const usernameRequirementsText = useAutoTranslation("3-20 characters. Letters, numbers, and underscores only.", language);
  const settingText = useAutoTranslation("Setting...", language);
  const setUsernameButtonText = useAutoTranslation("Set Username", language);

  // Translation hooks - Username Edit Form
  const updatingText = useAutoTranslation("Updating...", language);
  const updateUsernameText = useAutoTranslation("Update Username", language);

  // Translation hooks - Toast Messages
  const couldNotSetUsernameText = useAutoTranslation("Could not set username.", language);
  const couldNotUpdateUsernameText = useAutoTranslation("Could not update username.", language);
  const pleaseEnterUsernameText = useAutoTranslation("Please enter a username", language);
  const usernameMinLengthText = useAutoTranslation("Username must be at least 3 characters long", language);
  const usernameSetSuccessText = useAutoTranslation("Username set successfully!", language);
  const usernameCannotBeEmptyText = useAutoTranslation("Username cannot be empty", language);
  const usernameMaxLengthText = useAutoTranslation("Username must be 20 characters or less", language);
  const usernameInvalidCharsText = useAutoTranslation("Username can only contain letters, numbers, and underscores", language);
  const usernameUpdatedSuccessText = useAutoTranslation("Username updated successfully!", language);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedIdentity === "username" && !hasUsername) {
      setShowUsernameSetup(true);
      return;
    }
    if (selectedIdentity) {
      onConfirm(selectedIdentity);
    }
  };

  const handleEditUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUsernameInput(currentUsername.replace("@", ""));
    setShowUsernameEdit(true);
  };

  const handleUsernameSet = (newUsername: string) => {
    const formData = new FormData();
    formData.append("username", newUsername);

    updateUser([id, formData], {
      onSuccess: () => {
        refetch();
        setShowUsernameSetup(false);
        setSelectedIdentity("username");
      },
      onError: () => {
        toast.error(couldNotSetUsernameText, { closeButton: true });
      },
    });
  };

  const handleUsernameUpdate = (newUsername: string) => {
    const formData = new FormData();
    formData.append("username", newUsername);

    updateUser([id, formData], {
      onSuccess: () => {
        refetch();
        setShowUsernameEdit(false);
      },
      onError: () => {
        toast.error(couldNotUpdateUsernameText, { closeButton: true });
      },
    });
  };

  // ---------- Username Setup Form ----------
  const UsernameSetupForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!usernameInput.trim()) {
        toast.error(pleaseEnterUsernameText, { closeButton: true });
        return;
      }
      if (usernameInput.length < 3) {
        toast.error(usernameMinLengthText, { closeButton: true });
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        handleUsernameSet(usernameInput.trim());
        toast.success(usernameSetSuccessText, { closeButton: true });
        setIsLoading(false);
        setUsernameInput("");
      }, 1000);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-2">{usernameText}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-[10px]">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder={enterUsernameText}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-[10px] focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{usernameRequirementsText}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowUsernameSetup(false)}
            disabled={isLoading}
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-[10px] py-2 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading || !usernameInput.trim()}
            className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
              isLoading || !usernameInput.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-800 hover:bg-red-700"
            }`}
          >
            {isLoading ? settingText : setUsernameButtonText}
          </button>
        </div>
      </form>
    );
  };

  // ---------- Username Edit Form ----------
  const UsernameEditForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!usernameInput.trim()) {
        toast.error(usernameCannotBeEmptyText, { closeButton: true });
        return;
      }
      if (usernameInput.length < 3) {
        toast.error(usernameMinLengthText, { closeButton: true });
        return;
      }
      if (usernameInput.length > 20) {
        toast.error(usernameMaxLengthText, { closeButton: true });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) {
        toast.error(usernameInvalidCharsText, { closeButton: true });
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        handleUsernameUpdate(usernameInput);
        toast.success(usernameUpdatedSuccessText, { closeButton: true });
        setIsLoading(false);
      }, 1000);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-7 mt-4">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">{usernameText}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-[10px]">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-[10px] focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={enterUsernameText}
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{usernameRequirementsText}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !usernameInput.trim()}
            className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
              isLoading || !usernameInput.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-800 hover:bg-red-700"
            }`}
          >
            {isLoading ? updatingText : updateUsernameText}
          </button>
        </div>
      </form>
    );
  };

  // ---------- Main Container ----------
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xs mx-4 relative" onClick={(e) => e.stopPropagation()}>
          <div className="py-6 px-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{placeYourBidText}</h2>
              <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                <X size={17} />
              </button>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-[10px]">{chooseNameText}</p>

            {/* Username / Anonymous Options */}
            {!showUsernameSetup && !showUsernameEdit && (
              <div className="space-y-4 my-7">
                {/* Username Option */}
                <div
                  className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                    selectedIdentity === "username"
                      ? "border-red-800 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-red-800 dark:hover:border-red-400"
                  }`}
                  onClick={() => (hasUsername ? setSelectedIdentity("username") : setShowUsernameSetup(true))}
                >
                  <div className="flex items-start gap-3">
                    <i className="bx bx-user"></i>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[10px] text-gray-900 dark:text-gray-100">{useMyUsernameText}</h3>
                        {hasUsername && (
                          <button
                            onClick={handleEditUsername}
                            className="text-red-800 dark:text-red-400 text-[10px] flex items-center gap-1 hover:underline"
                          >
                            <Pencil size={10} /> {editText}
                          </button>
                        )}
                      </div>
                      {!hasUsername && (
                        <span className="text-black dark:text-white mt-1 block">
                          <button onClick={() => setShowUsernameSetup(true)} className="font-medium text-[10px] hover:underline">
                            {setUpUsernameText}
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Anonymous Option */}
                <div
                  className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                    selectedIdentity === "anonymous"
                      ? "border-red-800 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-red-800 dark:hover:border-red-400"
                  }`}
                  onClick={() => setSelectedIdentity("anonymous")}
                >
                  <div className="flex items-start gap-3">
                    <i className="bx bx-hide"></i>
                    <div className="flex-1">
                      <h3 className="font-medium text-[10px] text-gray-900 dark:text-gray-100">{bidAnonymouslyText}</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Username Setup */}
            {showUsernameSetup && <UsernameSetupForm />}

            {/* Inline Username Edit */}
            {showUsernameEdit && <UsernameEditForm />}

            {!showUsernameSetup && !showUsernameEdit && (
              <>
                <div className="text-[8px] text-left -mt-4 ml-2">
                  <a
                    href="#"
                    className="text-red-800 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(privacyInfoText, { closeButton: true });
                    }}
                  >
                    {learnMoreText}
                  </a>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-[10px] py-2 rounded-full font-medium transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedIdentity}
                    className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
                      selectedIdentity ? "bg-red-800 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {selectedIdentity === "username" && !hasUsername ? setUsernameText : confirmText}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IdentitySelectionPopup;
