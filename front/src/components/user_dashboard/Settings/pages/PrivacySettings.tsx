import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import useBlockedUsers from "@/hooks/users/block/useBlockedUsers";
import useUnblockUser from "@/hooks/users/block/useUnblockUser";
import ActionButtons from "../components/ActionButtons";
import UnblockConfirmationModal from "../components/UnblockConfirmationModal";
import { UserX, Lock } from "lucide-react";
import { toast } from "sonner";

interface BlockedUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

const PrivacySettings = () => {
  const { language: selectedLanguage } = useLanguage();
  const { data: blockedUsers = [], isLoading, error, refetch } = useBlockedUsers();
  const unblockUserMutation = useUnblockUser();
  
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);

  // Refetch blocked users when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-translated labels
  const privacySettingsLabel = useAutoTranslation("Privacy Settings", selectedLanguage);
  const manageVisibilityLabel = useAutoTranslation("Manage your account visibility and blocked users.", selectedLanguage);
  const blockedUsersLabel = useAutoTranslation("Blocked Users", selectedLanguage);
  const blockedUsersDesc = useAutoTranslation("These are the users you've blocked. They cannot message you, view your profile, or interact with your posts. You can unblock them anytime.", selectedLanguage);
  const unblockLabel = useAutoTranslation("Unblock", selectedLanguage);
  const noBlockedUsersLabel = useAutoTranslation("You haven't blocked anyone yet.", selectedLanguage);
  const loadingLabel = useAutoTranslation("Loading...", selectedLanguage);
  const errorLabel = useAutoTranslation("Error loading blocked users", selectedLanguage);
  const blockedUsersWillAppearLabel = useAutoTranslation("Blocked users will appear here when you block someone.", selectedLanguage);
  const recentlyBlockedLabel = useAutoTranslation("Recently blocked", selectedLanguage);
  const userUnblockedSuccessLabel = useAutoTranslation("User unblocked successfully", selectedLanguage);
  const userUnblockedDescLabel = useAutoTranslation("has been unblocked.", selectedLanguage);
  const failedToUnblockLabel = useAutoTranslation("Failed to unblock user", selectedLanguage);
  const tryAgainLaterLabel = useAutoTranslation("Please try again later.", selectedLanguage);

  const handleUnblockClick = (user: BlockedUser) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
  };

  const handleUnblockConfirm = () => {
    if (selectedUser) {
      unblockUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          toast.success(
            userUnblockedSuccessLabel,
            {
              description: `${selectedUser.username} ${userUnblockedDescLabel}`,
            }
          );
          setShowUnblockModal(false);
          setSelectedUser(null);
        },
        onError: (error) => {
          toast.error(
            failedToUnblockLabel,
            {
              description: error.message || tryAgainLaterLabel,
            }
          );
        },
      });
    }
  };

  const handleUnblockCancel = () => {
    setShowUnblockModal(false);
    setSelectedUser(null);
  };

  const hasChanges = () => false; // Privacy settings don't have form changes to track
  const handleSave = () => {}; // No save action needed for privacy settings
  const handleReset = () => {}; // No reset action needed for privacy settings

  const formatDate = (dateString: string) => {
    // Since we don't have block date in the current API, we'll show a placeholder
    return recentlyBlockedLabel;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-gray-500">{loadingLabel}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-red-500">{errorLabel}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-sm font-bold mb-2">{privacySettingsLabel}</h2>
        <p className="text-[11px] text-gray-500">{manageVisibilityLabel}</p>
      </div>

      {/* Blocked Users Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold mb-2">{blockedUsersLabel}</h3>
        <p className="text-[11px] text-gray-500 mb-6">{blockedUsersDesc}</p>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {blockedUsers.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-gray-100 mb-4">
                <UserX className="w-6 h-6 text-gray-400" />
              </div>
               <p className="text-xs text-gray-500 mb-2">{noBlockedUsersLabel}</p>
               <p className="text-[10px] text-gray-400">
                 {blockedUsersWillAppearLabel}
               </p>
            </div>
          ) : (
            // Blocked users list
            <div className="space-y-4">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {user.first_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.username
                        }
                      </p>
                      <p className="text-[10px] text-gray-400">@{user.username}</p>
                      <p className="text-[10px] text-gray-400">{formatDate("")}</p>
                    </div>
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => handleUnblockClick(user)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 hover:border-red-300 rounded-full transition-colors"
                  >
                    {unblockLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons 
        hasChanges={hasChanges()} 
        onSave={handleSave} 
        onReset={handleReset} 
      />

      {/* Unblock Confirmation Modal */}
      <UnblockConfirmationModal
        isOpen={showUnblockModal}
        onClose={handleUnblockCancel}
        onConfirm={handleUnblockConfirm}
        username={selectedUser?.username || ""}
        isLoading={unblockUserMutation.isPending}
      />
    </div>
  );
};

export default PrivacySettings;
