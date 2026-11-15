import { StatCard } from "@/components/ui/stat-card";
import { GraduationCap, Users, BookOpen, Wallet } from "lucide-react";

export function DashboardKpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Students"
        value="1,245"
        icon={GraduationCap}
        trend={12}
        variant="primary"
      />
      <StatCard
        label="Total Teachers"
        value="78"
        icon={BookOpen}
        trend={4}
        variant="info"
      />
      <StatCard
        label="Active Users"
        value="1,359"
        icon={Users}
        trend={8}
        variant="success"
      />
      <StatCard
        label="Fees Collected"
        value="Rs. 8.1M"
        icon={Wallet}
        trend={-3}
        variant="warning"
      />
    </div>
  );
}

