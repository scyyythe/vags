import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  textColor?: string;
}

const Logo = ({ textColor = 'text-white' }: LogoProps) => {
  return (
      <Link to="/index" className="flex items-center space-x-2 cursor-pointer">
        <img src="/pics/logo.png" alt="logo" className=" w-12 h-12 cursor-pointer" />
        <span className={`-ml-4 mt-3 text-1lg font-semibold cursor-pointer ${textColor}`}>orxist</span>
      </Link>
  );
};

export default Logo;