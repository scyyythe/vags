import React, { useState } from "react";
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
const SecuritySettings = () => {
  const userId = getLoggedInUserId();
  const { username, email, password, isLoading, error } = useUserDetails(userId);
  const updateUser = useUpdateUserDetails();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      device: "Mac OS Safari 15.1",
      date: "10 Feb 2023 at 5:12PM",
      isCurrentSession: false,
    },
    {
      id: 2,
      device: "iOS Safari 15.1",
      date: "22 Apr 2023 at 7:03AM",
      isCurrentSession: true,
    },
  ]);

  const [originalCredentials, setOriginalCredentials] = useState([...credentials]);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        toast.error("All password fields are required.");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("New password must be at least 8 characters long.");
        return;
      }

      if (newPassword === currentPassword) {
        toast.error("New password must be different from the current password.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }

      data.append("current_password", currentPassword);
      data.append("new_password", newPassword);
    }

    updateUser.mutate([userId, data], {
      onSuccess: () => {
        toast.success("User updated successfully.");
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
          toast.error(message || "Failed to update user.");
        } else {
          toast.error("Failed to update user.");
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

  const removeDevice = (id: number) => {
    setCredentials(credentials.filter((cred) => cred.id !== id));
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching user data</p>;

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Login Details</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">Current Password</p>
              <p className="font-medium text-xs">
                {isEditingPassword ? "" : "Enter your current password to make changes."}
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
                <label className="block text-[10px] text-gray-500 mb-1">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    className="w-full pr-10"
                    style={{ fontSize: "11px" }}
                    placeholder={formData.currentPassword ? "" : "Enter current password"}
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
                <label className="block text-[10px] text-gray-500 mb-1">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    className="w-full pr-10"
                    style={{ fontSize: "11px" }}
                    placeholder="Enter new password"
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
                <label className="block text-[10px] text-gray-500 mb-1">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full pr-10"
                    style={{ fontSize: "11px" }}
                    placeholder="Confirm new password"
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
              <p className="text-[10px] text-gray-500">2-Step Verification</p>
              <p className="font-medium text-[11px]">{formData.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
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
      <h2 className="text-sm font-bold mb-6">Security Credentials</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {credentials.map((cred) => (
            <div key={cred.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="border border-gray-200 p-0.5 rounded">
                  <i className="bx bx-tab"></i>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">{cred.date}</p>
                  <p className="text-xs font-semibold">{cred.device}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {cred.isCurrentSession ? (
                  <span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full">Current session</span>
                ) : (
                  <button onClick={() => removeDevice(cred.id)} className="text-red-500 text-[10px] hover:text-red-700">
                    Remove device
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
