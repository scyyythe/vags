import React from "react";
import { Environment } from "../components/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface EnvironmentSelectorProps {
  environments: Environment[];
  selectedEnvironment: number | null;
  handleEnvironmentChange: (envId: number) => void;
  viewMode: "owner" | "collaborator" | "review" | "monitoring" | "preview";
  isReadOnly: boolean;
  collaboratorCount: number;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  selectedEnvironment,
  handleEnvironmentChange,
  viewMode,
  isReadOnly,
  collaboratorCount,
}) => {
  const { language } = useLanguage();

  // Translation hooks for all text content
  const virtualEnvironmentText = useAutoTranslation("Virtual Environment", language);
  const slotsText = useAutoTranslation("slots", language);
  const tooManyCollaboratorsText = useAutoTranslation("Too many collaborators", language);

  return (
    <div>
      <h3 className="text-xs font-medium mb-4">{virtualEnvironmentText}</h3>
      <div className="grid grid-cols-3 gap-2">
        {environments.map((env) => {
          // Get maximum allowed collaborators for this environment
          let maxAllowedCollaborators = 0;
          if (env.slots === 4) {
            maxAllowedCollaborators = 1;
          } else if (env.slots === 6) {
            maxAllowedCollaborators = 2;
          } else if (env.slots === 10) {
            maxAllowedCollaborators = 2;
          }

          const isDisabled = collaboratorCount > maxAllowedCollaborators;

          return (
            <div
              key={env.id}
              onClick={() => {
                if (viewMode === "owner" && !isReadOnly) {
                  handleEnvironmentChange(env.id);
                }
              }}
              className={`rounded-lg overflow-hidden 
                ${viewMode === "owner" && !isReadOnly && !isDisabled ? "cursor-pointer" : ""}
                border-2 ${selectedEnvironment === env.id ? "border-gray-200" : "border-transparent"}
                ${isDisabled ? "opacity-50 pointer-events-none" : ""}
              `}
            >
              <img src={env.image} alt={`Environment ${env.id}`} className="w-full h-24 object-cover" />
              <div className="p-2 text-[10px] text-center">
                {env.slots} {slotsText}
                {isDisabled && <p className="text-[9px] text-red-500 mt-1">{tooManyCollaboratorsText}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnvironmentSelector;
