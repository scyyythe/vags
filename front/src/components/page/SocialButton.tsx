import React from "react";
import "boxicons";

const SocialButton = ({ provider, text, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full p-2 border border-gray-400 rounded-full hover:bg-gray-100"
    >
      {icon && <i className={`${icon} text-xs mr-2`}></i>}
      {text}
    </button>
  );
};

export default SocialButton;
