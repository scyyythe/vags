import React, { useState } from "react";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { languages as allLanguages } from '@/components/constants/languages'; // use your full LANGUAGES.TS

interface EditableFieldProps {
  label: string;
  value: string | Date;
  type: "text" | "gender" | "date" | "country" | "language" | "email" | "readonly";
  onChange: (value: string | Date) => void;
}

const countries = [
  "United States",
  "Philippines",
  "Canada",
  "United Kingdom",
  "Australia",
  "France",
  "Germany",
  "Japan",
  "China",
  "Brazil",
];

const EditableField = ({ label, value, type, onChange }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { language: currentLang, setLanguage } = useLanguage(); // Language context

  const handleEdit = () => {
    if (type !== "readonly") {
      setIsEditing(true);
    }
  };

  const handleChange = (newValue: string | Date) => {
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "gender" && type !== "country" && type !== "language") {
      setIsEditing(false);
    }
  };

  const handleClickOutside = () => {
    if (type !== "gender" && type !== "country" && type !== "language") {
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-6 text-xs">
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>

      {isEditing ? (
        <div className="text-[12px]">
          {type === "text" || type === "email" ? (
            <div className="flex text-[12px]">
              <Input
                type={type === "email" ? "email" : "text"}
                value={value as string}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleClickOutside}
                autoFocus
                className="border-gray-300 !text-[12px]"
              />
            </div>
          ) : type === "gender" ? (
            <div className="space-y-2">
              <RadioGroup
                defaultValue={value as string}
                onValueChange={(value) => handleChange(value)}
                className="flex flex-col space-y-2 text-[10px]"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" className="text-[10px]" />
                  <Label htmlFor="female" className="text-[12px]">
                    Female
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" className="text-[10px]" />
                  <Label htmlFor="male" className="text-[12px]">
                    Male
                  </Label>
                </div>
              </RadioGroup>
              <button onClick={() => setIsEditing(false)} className="text-[10px] text-gray-500 hover:text-gray-700">
                Done
              </button>
            </div>
          ) : type === "date" ? (
            <div className="relative">
              {/* Editable input field */}
              <Input
                type="text"
                placeholder="MM/DD/YYYY"
                value={value instanceof Date ? format(value, "MM/dd/yyyy") : value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleClickOutside}
                className="border-gray-300 !text-[12px] pr-8"
              />

              {/* Calendar Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 hover:text-gray-700"
                  >
                    <i className='bx bx-calendar-alt'></i>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-2" align="start">
                  <CalendarWithDropdown
                    value={value}
                    onChange={(date) => {
                      handleChange(date);
                      setIsEditing(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : type === "country" ? (
            <div className="space-y-2">
              <Select defaultValue={value as string} onValueChange={(value) => handleChange(value)}>
                <SelectTrigger className="w-full text-[12px]">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => setIsEditing(false)} className="text-[10px] text-gray-500 hover:text-gray-700">
                Done
              </button>
            </div>
          ) : type === "language" ? (
            <div className="space-y-2">
              <Select
                value={currentLang} // use context value
                onValueChange={(value) => {
                  handleChange(value); // update formData
                  setLanguage(value); // update global language
                }}
              >
                <SelectTrigger className="w-full text-[12px]">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {allLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => setIsEditing(false)} className="text-[10px] text-gray-500 hover:text-gray-700">
                Done
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="text-gray-900 font-medium">{value instanceof Date ? format(value, "PP") : value}</div>
          {type !== "readonly" && (
            <button onClick={handleEdit} className="text-gray-500 hover:text-gray-700 p-1">
              <i className="bx bx-pencil"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CalendarWithDropdown = ({ value, onChange }: { value: string | Date; onChange: (date: Date) => void }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    value instanceof Date ? value.getMonth() : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    value instanceof Date ? value.getFullYear() : new Date().getFullYear()
  );

  const currentMonth = new Date(selectedYear, selectedMonth, 1);

  return (
    <div>
      {/* Month + Year dropdown */}
      <div className="flex items-center justify-center gap-12 pt-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="text-md focus:outline-none focus:ring-0 focus:border-none"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="text-md focus:outline-none focus:ring-0 focus:border-none"
        >
          {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar display */}
      <Calendar
        mode="single"
        month={currentMonth}
        selected={value instanceof Date ? value : new Date(value)}
        onSelect={(date) => date && onChange(date)}
        className="pointer-events-auto"
      />
    </div>
  );
};


export default EditableField;
