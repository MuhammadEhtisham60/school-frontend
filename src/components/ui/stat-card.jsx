import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/utils";
const variantClass = {
  primary: "gradient-primary",
  success: "gradient-success",
  warning: "gradient-warning",
  info: "gradient-info",
};
export function StatCard({ label, value, icon: Icon, trend, variant = "primary", sub }) {
  const positive = (trend ?? 0) >= 0;
  return (
    <Card className="relative overflow-hidden p-5 card-hover gradient-card border-border/60 shadow-card">
      <div
        className={cn(
          "absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-20 blur-2xl",
          variantClass[variant],
        )}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {trend !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-3 text-xs font-semibold px-2 py-1 rounded-full",
                positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}
              {trend}% vs last month
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl shadow-glow",
            variantClass[variant],
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
