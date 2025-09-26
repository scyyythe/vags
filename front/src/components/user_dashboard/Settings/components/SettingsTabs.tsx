import React from "react";
import { cn } from "@/lib/utils";
import { User, Bell, CreditCard, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const SettingsTabs = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const { language: selectedLanguage } = useLanguage();

  // Translated tab names
  const tabs = [
    {
      name: useAutoTranslation("Edit Profile", selectedLanguage),
      path: "/settings/edit-profile",
      icon: <i className='bx bx-pencil mr-2'></i>
    },
    {
      name: useAutoTranslation("Account Details", selectedLanguage),
      path: "/settings/account-details",
      icon: <User className="w-3 h-3 mr-2" />
    },
    {
      name: useAutoTranslation("Security", selectedLanguage),
      path: "/settings/security",
      icon: <i className='bx bxs-devices mr-2'></i>
    },
    {
      name: useAutoTranslation("Notifications", selectedLanguage),
      path: "/settings/notifications",
      icon: <Bell className="w-3 h-3 mr-2" />
    },
    {
      name: useAutoTranslation("Billing", selectedLanguage),
      path: "/settings/billing",
      icon: <CreditCard className="w-3 h-3 mr-2" />
    },
    {
      name: useAutoTranslation("Help Center", selectedLanguage),
      path: "/settings/help-center",
      icon: <HelpCircle className="w-3 h-3 mr-2" />
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 mb-8">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={cn(
            "flex items-center px-3 py-2 text-xs font-medium transition-all relative border-b-2",
            pathname === tab.path
              ? "text-gray-900 border-black"
              : "text-gray-500 hover:text-gray-700 border-transparent"
          )}
        >
          {tab.icon}
          {tab.name}
        </Link>
      ))}
    </div>
  );
};

export default SettingsTabs;
