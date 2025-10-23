import React from "react";
import "boxicons";

const SocialButton = ({ provider, text, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full p-2 border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      {icon && <i className={`${icon} text-xs mr-2`}></i>}
      {text}
    </button>
  );
};

export default SocialButton;
