import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ActionButtons from "../components/ActionButtons";
import { Edit } from "lucide-react";

const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: "••••••••",
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setOriginalData({ ...formData });
    setOriginalCredentials([...credentials]);
    setIsEditingPassword(false);
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

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Login Details</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">Current Password</p>
              <p className="font-medium text-xs">{isEditingPassword ? "" : formData.currentPassword}</p>
            </div>
            <button 
              onClick={() => setIsEditingPassword(!isEditingPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className='bx bx-pencil text-xs'></i>
            </button>
          </div>
          
          {isEditingPassword && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Current Password</label>
                <Input
                  type="password"
                  value={formData.currentPassword === "••••••••" ? "" : formData.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  className="w-full"
                  style={{
                    fontSize: "12px",
                  }}
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">New Password</label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="w-full"
                  style={{
                    fontSize: "12px",
                  }}
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full"
                  style={{
                    fontSize: "12px",
                  }}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500">2-Step Verification</p>
              <p className="font-medium text-xs">{formData.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
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
      
      <h2 className="text-sm font-bold mb-6">Security Credentials</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {credentials.map((cred) => (
            <div key={cred.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="border border-gray-200 p-0.5 rounded">
                  <i className='bx bx-tab'></i>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">{cred.date}</p>
                  <p className="text-xs font-semibold">{cred.device}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {cred.isCurrentSession && (
                  <span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full">
                    Current session
                  </span>
                )}
                {!cred.isCurrentSession && (
                  <button
                    onClick={() => removeDevice(cred.id)}
                    className="text-red-500 text-[10px] hover:text-red-700"
                  >
                    Remove device
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <ActionButtons
        hasChanges={hasChanges()}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
};

export default SecuritySettings;
