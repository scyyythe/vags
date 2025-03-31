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
      <label className="text-xs font-medium mb-2">{label}</label>
      <div className="relative">
        {icon && <i className={`${icon} absolute left-3 top-3 text-gray-500`}></i>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-400 text-xs rounded-full"
        />
      </div>
    </div>
  );
};

export default InputField;
