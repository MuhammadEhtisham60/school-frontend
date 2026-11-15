import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { admissionTrends } from "@/data/mock-data";

export function AdmissionsTrendsChart() {
  return (
    <Card className="lg:col-span-2 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Admissions & Enquiries</h3>
          <p className="text-sm text-muted-foreground">Last 8 months trend</p>
        </div>
        <Badge variant="secondary" className="bg-success/10 text-success border-0">
          ↑ 24%
        </Badge>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={admissionTrends}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.7 0.18 320)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.7 0.18 320)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="enquiries"
            stroke="oklch(0.7 0.18 320)"
            fill="url(#g2)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="admissions"
            stroke="oklch(0.55 0.22 280)"
            fill="url(#g1)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

