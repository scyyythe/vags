import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ActionButtons from "../components/ActionButtons";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface NotificationSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationsSettings = () => {
  const { language: selectedLanguage } = useLanguage();
  const translate = useAutoTranslation;

  // Heading translation
  const notificationsLabel = translate("Notifications", selectedLanguage);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: "product-updates", category: "", title: "", description: "", enabled: true },
    { id: "reminders", category: "", title: "", description: "", enabled: false },
    { id: "promotions", category: "", title: "", description: "", enabled: true },
    { id: "policy", category: "", title: "", description: "", enabled: true },
    { id: "account", category: "", title: "", description: "", enabled: false },
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

  const handleSave = () => setOriginalNotifications([...notifications]);
  const handleReset = () => setNotifications([...originalNotifications]);
  const hasChanges = () => JSON.stringify(notifications) !== JSON.stringify(originalNotifications);

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">{notificationsLabel}</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-8">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">
                  {notification.id === "product-updates" && translate("Product updates", selectedLanguage)}
                  {notification.id === "reminders" && translate("Reminders", selectedLanguage)}
                  {notification.id === "promotions" && translate("Promotions and tips", selectedLanguage)}
                  {notification.id === "policy" && translate("Policy and Community", selectedLanguage)}
                  {notification.id === "account" && translate("Account support", selectedLanguage)}
                </p>
                <h3 className="font-medium text-xs">
                  {notification.id === "product-updates" && translate("Receive messages from our platform", selectedLanguage)}
                  {notification.id === "reminders" && translate("Receive booking reminders, pricing notices", selectedLanguage)}
                  {notification.id === "promotions" && translate("Receive coupons, promotions, surveys", selectedLanguage)}
                  {notification.id === "policy" && translate("Receive updates on ...?", selectedLanguage)}
                  {notification.id === "account" && translate("Receive messages about your account, your trips, legal alerts", selectedLanguage)}
                </h3>
              </div>
              <div className="transform scale-50 origin-left">
                <Switch
                  checked={notification.enabled}
                  onCheckedChange={() => toggleNotification(notification.id)}
                  className={notification.enabled ? "bg-red-500" : ""}
                />
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

export default NotificationsSettings;
