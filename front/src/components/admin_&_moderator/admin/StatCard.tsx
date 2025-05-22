import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[11px] font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-sm font-bold">{value}</div>
        {description && (
          <p className="text-[10px] text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-1">
            <span
              className={`text-[9px] ${
                trend.positive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.positive ? "+" : "-"}
              {trend.value}%
            </span>
            <span className="text-[9px] text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
