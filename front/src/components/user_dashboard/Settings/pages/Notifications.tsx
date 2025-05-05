import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ActionButtons from "../components/ActionButtons";

interface NotificationSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationsSettings = () => {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "product-updates",
      category: "Product updates",
      title: "Receive messages from our platform",
      description: "",
      enabled: true,
    },
    {
      id: "reminders",
      category: "Reminders",
      title: "Receive booking reminders, pricing notices",
      description: "",
      enabled: false,
    },
    {
      id: "promotions",
      category: "Promotions and tips",
      title: "Receive coupons, promotions, surveys",
      description: "",
      enabled: true,
    },
    {
      id: "policy",
      category: "Policy and Community",
      title: "Receive updates on ...?",
      description: "",
      enabled: true,
    },
    {
      id: "account",
      category: "Account support",
      title: "Receive messages about your account, your trips, legal alerts",
      description: "",
      enabled: false,
    },
  ]);
  
  const [originalNotifications, setOriginalNotifications] = useState([...notifications]);

  const toggleNotification = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const handleSave = () => {
    setOriginalNotifications([...notifications]);
  };

  const handleReset = () => {
    setNotifications([...originalNotifications]);
  };

  const hasChanges = () => {
    return JSON.stringify(notifications) !== JSON.stringify(originalNotifications);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-8">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{notification.category}</p>
                <h3 className="font-medium">{notification.title}</h3>
              </div>
              <Switch
                checked={notification.enabled}
                onCheckedChange={() => toggleNotification(notification.id)}
                className={notification.enabled ? "bg-red-500" : ""}
              />
            </div>
          ))}
        </div>
      </div>
      
      <ActionButtons
        hasChanges={hasChanges()}
        onSave={handleSave}
        onReset={handleReset}
        saveText="Update Settings"
        cancelText="Cancel"
      />
    </div>
  );
};

export default NotificationsSettings;
