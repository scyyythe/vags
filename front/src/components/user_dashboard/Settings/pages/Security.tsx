import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ActionButtons from "../components/ActionButtons";
import { Edit, Eye, EyeOff } from "lucide-react";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface Credential {
  id: string;
  device: string;
  date: string;
  isCurrentSession: boolean;
}

const SecuritySettings = () => {
  const userId = getLoggedInUserId();
  const { username, email, password, isLoading, error } = useUserDetails(userId);
  const updateUser = useUpdateUserDetails();
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated labels
  const loginDetailsLabel = useAutoTranslation("Login Details", selectedLanguage);
  const currentPasswordLabel = useAutoTranslation("Current Password", selectedLanguage);
  const newPasswordLabel = useAutoTranslation("New Password", selectedLanguage);
  const confirmPasswordLabel = useAutoTranslation("Confirm Password", selectedLanguage);
  const enterCurrentDesc = useAutoTranslation("Enter your current password to make changes.", selectedLanguage);
  const twoFactorLabel = useAutoTranslation("2-Step Verification", selectedLanguage);
  const enabledText = useAutoTranslation("Enabled", selectedLanguage);
  const disabledText = useAutoTranslation("Disabled", selectedLanguage);
  const securityCredentialsLabel = useAutoTranslation("Security Credentials", selectedLanguage);
  const currentSessionText = useAutoTranslation("Current session", selectedLanguage);
  const removeDeviceText = useAutoTranslation("Remove device", selectedLanguage);
  const loadingText = useAutoTranslation("Loading...", selectedLanguage);
  const fetchErrorText = useAutoTranslation("Error fetching user data", selectedLanguage);
  const fetchSessionsError = useAutoTranslation("Failed to fetch sessions", selectedLanguage);
  const deviceRemovedText = useAutoTranslation("Device removed", selectedLanguage);
  const removeDeviceFailedText = useAutoTranslation("Failed to remove device", selectedLanguage);

  const allPasswordRequired = useAutoTranslation("All password fields are required.", selectedLanguage);
  const newPasswordLengthError = useAutoTranslation("New password must be at least 8 characters long.", selectedLanguage);
  const newPasswordSameError = useAutoTranslation("New password must be different from the current password.", selectedLanguage);
  const newPasswordMismatchError = useAutoTranslation("New passwords do not match.", selectedLanguage);
  const userUpdateSuccess = useAutoTranslation("User updated successfully.", selectedLanguage);
  const userUpdateFailed = useAutoTranslation("Failed to update user.", selectedLanguage);

  // Form state
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
  });
  const [originalData, setOriginalData] = useState({ ...formData });
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [originalCredentials, setOriginalCredentials] = useState<Credential[]>([]);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    apiClient
      .get("/sessions/")
      .then((res) => {
        setCredentials(res.data);
        setOriginalCredentials(res.data);
      })
      .catch(() => {
        toast.error(fetchSessionsError);
      });
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const data = new FormData();
    const { currentPassword, newPassword, confirmPassword } = formData;

    const wantsToChangePassword = currentPassword || newPassword || confirmPassword;

    if (wantsToChangePassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error(allPasswordRequired, { closeButton: true });
        return;
      }

      if (newPassword.length < 8) {
        toast.error(newPasswordLengthError, { closeButton: true });
        return;
      }

      if (newPassword === currentPassword) {
        toast.error(newPasswordSameError, { closeButton: true });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error(newPasswordMismatchError, { closeButton: true });
        return;
      }

      data.append("current_password", currentPassword);
      data.append("new_password", newPassword);
    }

    updateUser.mutate([userId, data], {
      onSuccess: () => {
        toast.success(userUpdateSuccess, { closeButton: true });
        setOriginalData({ ...formData });
        setOriginalCredentials([...credentials]);
        setIsEditingPassword(false);
      },
      onError: (error: AxiosError<{ [key: string]: string[] | string }>) => {
        const responseData = error.response?.data;
        if (responseData) {
          const firstKey = Object.keys(responseData)[0];
          const message = Array.isArray(responseData[firstKey])
            ? (responseData[firstKey] as string[])[0]
            : (responseData[firstKey] as string);
          toast.error(message || userUpdateFailed, { closeButton: true });
        } else {
          toast.error(userUpdateFailed, { closeButton: true });
        }
      },
    });
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setCredentials([...originalCredentials]);
    setIsEditingPassword(false);
  };

  const hasChanges = () => {
    if (isEditingPassword) return true;

    return (
      JSON.stringify(formData) !== JSON.stringify(originalData) ||
      JSON.stringify(credentials) !== JSON.stringify(originalCredentials)
    );
  };

  const removeDevice = async (id: string) => {
    try {
      await apiClient.delete(`/sessions/${id}/`);
      setCredentials((prev) => prev.filter((cred) => cred.id !== id));
      toast.success(deviceRemovedText);
    } catch {
      toast.error(removeDeviceFailedText);
    }
  };

  if (isLoading) return <p>{loadingText}</p>;
  if (error) return <p>{fetchErrorText}</p>;

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">{loginDetailsLabel}</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">{currentPasswordLabel}</p>
              <p className="font-medium text-xs">
                {isEditingPassword ? "" : enterCurrentDesc}
              </p>
            </div>
            <button
              onClick={() => setIsEditingPassword(!isEditingPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="bx bx-pencil text-xs"></i>
            </button>
          </div>

          {isEditingPassword && (
            <div className="mt-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">{currentPasswordLabel}</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    className="w-full pr-10"
                    style={{ fontSize: "11px" }}
                    placeholder={formData.currentPassword ? "" : currentPasswordLabel}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                  >
                    {showCurrentPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">{newPasswordLabel}</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    className="w-full pr-10"
                    style={{ fontSize: "11px" }}
                    placeholder={newPasswordLabel}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">{confirmPasswordLabel}</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full pr-10"
                    style={{ fontSize: "11px" }}
                    placeholder={confirmPasswordLabel}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Two Factor */}
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500">{twoFactorLabel}</p>
              <p className="font-medium text-[11px]">{formData.twoFactorEnabled ? enabledText : disabledText}</p>
            </div>
            <div className="transform scale-50 origin-left">
              <Switch
                checked={formData.twoFactorEnabled}
                onCheckedChange={(checked) => handleChange("twoFactorEnabled", checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Credentials */}
      <h2 className="text-sm font-bold mb-6">{securityCredentialsLabel}</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {credentials.map((cred) => (
            <div key={cred.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="border border-gray-200 p-0.5 rounded">
                  <i className="bx bx-tab"></i>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">
                    {new Date(cred.date).toLocaleString("en-PH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p className="text-xs font-semibold">{cred.device}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {cred.isCurrentSession ? (
                  <span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full">{currentSessionText}</span>
                ) : (
                  <button
                    onClick={() => removeDevice(cred.id)}
                    className="text-red-500 text-[10px] hover:text-red-700"
                  >
                    {removeDeviceText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ActionButtons hasChanges={hasChanges()} onSave={handleSave} onReset={handleReset} />
    </div>
  );
};

export default SecuritySettings;
