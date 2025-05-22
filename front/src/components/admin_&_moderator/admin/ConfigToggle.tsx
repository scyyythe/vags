import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ConfigToggleProps {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  id: string;
}

export function ConfigToggle({
  label,
  description,
  defaultChecked = false,
  onToggle,
  id,
}: ConfigToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-xs">
          {label}
        </Label>
        {description && <p className="text-3xs text-muted-foreground">{description}</p>}
      </div>
      <Switch
        id={id}
        defaultChecked={defaultChecked}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
