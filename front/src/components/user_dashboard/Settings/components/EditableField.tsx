import React, { useState } from "react";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const languages = ["English", "Spanish", "French", "Chinese", "Japanese", "Filipino"];

const EditableField = ({ label, value, type, onChange }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => {
    if (type !== "readonly") {
      setIsEditing(true);
    }
  };
  
  const handleChange = (newValue: string | Date) => {
    onChange(newValue);
    if (type !== "gender" && type !== "country" && type !== "language" && type !== "date") {
      setIsEditing(false);
    }
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
    <div className="mb-6">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      
      {isEditing ? (
        <div>
          {type === "text" || type === "email" ? (
            <div className="flex">
              <Input
                type={type === "email" ? "email" : "text"}
                value={value as string}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleClickOutside}
                autoFocus
                className="border-gray-300"
              />
            </div>
          ) : type === "gender" ? (
            <div className="space-y-2">
              <RadioGroup
                defaultValue={value as string}
                onValueChange={(value) => handleChange(value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
              </RadioGroup>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Done
              </Button>
            </div>
          ) : type === "date" ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  {value instanceof Date
                    ? format(value, "PP")
                    : format(new Date(value), "PP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value instanceof Date ? value : new Date(value)}
                  onSelect={(date) => {
                    if (date) {
                      handleChange(date);
                      setIsEditing(false);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          ) : type === "country" ? (
            <div className="space-y-2">
              <Select
                defaultValue={value as string}
                onValueChange={(value) => handleChange(value)}
              >
                <SelectTrigger className="w-full">
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Done
              </Button>
            </div>
          ) : type === "language" ? (
            <div className="space-y-2">
              <Select
                defaultValue={value as string}
                onValueChange={(value) => handleChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Done
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="text-gray-900 font-medium">
            {value instanceof Date ? format(value, "PP") : value}
          </div>
          {type !== "readonly" && (
            <button
              onClick={handleEdit}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableField;
