import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, change, description }: StatsCardProps) {
  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={`text-xs mt-1 ${
            change.type === "positive" ? "text-success" :
            change.type === "negative" ? "text-destructive" : "text-muted-foreground"
          }`}>
            {change.value}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}