import React from "react";
import { Environment } from "../components/types";

interface EnvironmentSelectorProps {
  environments: Environment[];
  selectedEnvironment: number | null;
  handleEnvironmentChange: (envId: number) => void;
  viewMode: 'owner' | 'collaborator' | 'review' | 'monitoring' | 'preview';
  isReadOnly: boolean;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  selectedEnvironment,
  handleEnvironmentChange,
  viewMode,
  isReadOnly
}) => {
  return (
    <div>
      <h3 className="text-xs font-medium mb-4">Virtual Environment</h3>
      <div className="grid grid-cols-3 gap-2">
        {environments.map((env) => (
          <div 
            key={env.id}
            onClick={() => viewMode === 'owner' && !isReadOnly && handleEnvironmentChange(env.id)}
            className={`rounded-lg overflow-hidden ${viewMode === 'owner' && !isReadOnly ? 'cursor-pointer' : ''} border-2 ${
              selectedEnvironment === env.id ? "border-gray-200" : "border-transparent"
            } ${viewMode === 'collaborator' || isReadOnly ? 'opacity-70' : ''}`}
          >
            <img 
              src={env.image} 
              alt={`Environment ${env.id}`} 
              className="w-full h-24 object-cover"
            />
            <div className="p-2 text-[10px] text-center">
              {env.slots} slots
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentSelector;
