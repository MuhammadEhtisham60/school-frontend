import { Card } from "@/components/ui/card";
import { CircleDot } from "lucide-react";
import { recentActivity } from "@/data/mock-data";

export function RecentActivityCard() {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-semibold text-lg">Recent Activity</h3>
      <p className="text-sm text-muted-foreground mb-4">Live system events</p>
      <div className="space-y-3">
        {recentActivity.map((a) => (
          <div
            key={a.id}
            className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-muted/60 transition-smooth"
          >
            <div className="h-8 w-8 shrink-0 rounded-full gradient-primary flex items-center justify-center">
              <CircleDot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{a.text}</p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

