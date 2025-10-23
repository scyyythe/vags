import React from "react";

interface InputFieldProps {
  type: string;
  label: string;
  placeholder: string;
  icon?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ type, label, placeholder, icon, name, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-medium mb-2 text-gray-900 dark:text-gray-100">{label}</label>
      <div className="relative">
        {icon && <i className={`${icon} absolute left-3 text-xs top-2 text-gray-500 dark:text-gray-400`}></i>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-[10px] rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
        />
      </div>
    </div>
  );
};

export default InputField;
