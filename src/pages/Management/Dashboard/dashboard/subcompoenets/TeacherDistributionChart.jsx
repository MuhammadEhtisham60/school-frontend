import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { teacherDistribution } from "@/data/mock-data";

export function TeacherDistributionChart() {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Teacher Distribution by Subject</h3>
          <p className="text-sm text-muted-foreground">Faculty headcount per department</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={teacherDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="oklch(0.55 0.22 280)"
            strokeWidth={3}
            dot={{ r: 5, fill: "oklch(0.7 0.18 320)" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

