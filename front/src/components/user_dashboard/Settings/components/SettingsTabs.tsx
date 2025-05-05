import React from "react";
import { cn } from "@/lib/utils";
import { Edit, User, Shield, Bell, CreditCard, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const SettingsTabs = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const tabs = [
    {
      name: "Edit Profile",
      path: "/settings/edit-profile",
      icon: <Edit className="w-4 h-4 mr-2" />
    },
    {
      name: "Account Details",
      path: "/settings/account-details",
      icon: <User className="w-4 h-4 mr-2" />
    },
    {
      name: "Security",
      path: "/settings/security",
      icon: <Shield className="w-4 h-4 mr-2" />
    },
    {
      name: "Notifications",
      path: "/settings/notifications",
      icon: <Bell className="w-4 h-4 mr-2" />
    },
    {
      name: "Billing",
      path: "/settings/billing",
      icon: <CreditCard className="w-4 h-4 mr-2" />
    },
    {
      name: "Help Center",
      path: "/settings/help-center",
      icon: <HelpCircle className="w-4 h-4 mr-2" />
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 mb-8">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium transition-all relative",
            pathname === tab.path
              ? "text-gray-900 border-b-2 border-black -mb-px"
              : "text-gray-500 hover:text-gray-700"
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
