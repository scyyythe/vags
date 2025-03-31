import React from "react";

interface SocialButtonProps {
  provider: string;
  text: string;
  icon: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, text, icon }) => {
  const handleClick = () => {
    console.log(`Login with ${provider}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-50 transition-colors"
    >
      <i className={`${icon} text-lg`}></i>
      <span>{text}</span>
    </button>
  );
};

export default SocialButton;
