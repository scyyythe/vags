import React from "react";
import { Environment } from "../components/types";

interface EnvironmentSelectorProps {
  environments: Environment[];
  selectedEnvironment: number | null;
  handleEnvironmentChange: (envId: number) => void;
  viewMode: 'owner' | 'collaborator' | 'review' | 'monitoring' | 'preview';
  isReadOnly: boolean;
  collaboratorCount: number;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  selectedEnvironment,
  handleEnvironmentChange,
  viewMode,
  isReadOnly,
  collaboratorCount
}) => {
  return (
    <div>
      <h3 className="text-xs font-medium mb-4">Virtual Environment</h3>
      <div className="grid grid-cols-3 gap-2">
        {environments.map((env) => {
          const totalParticipants = collaboratorCount + 1;
          const isDisabled = env.slots < totalParticipants;

          return (
            <div
              key={env.id}
              onClick={() => {
                if (viewMode === 'owner' && !isReadOnly) {
                  handleEnvironmentChange(env.id);
                }
              }}
              className={`rounded-lg overflow-hidden 
                ${viewMode === 'owner' && !isReadOnly && !isDisabled ? 'cursor-pointer' : ''}
                border-2 ${selectedEnvironment === env.id ? 'border-gray-200' : 'border-transparent'}
                ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <img
                src={env.image}
                alt={`Environment ${env.id}`}
                className="w-full h-24 object-cover"
              />
              <div className="p-2 text-[10px] text-center">
                {env.slots} slots
                {isDisabled && (
                  <p className="text-[9px] text-red-500 mt-1">Not enough slots</p>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default EnvironmentSelector;
