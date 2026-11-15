import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { feeCollection } from "@/data/mock-data";

export function FeeCollectionChart() {
  return (
    <Card className="lg:col-span-2 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Fee Collection</h3>
          <p className="text-sm text-muted-foreground">Collected vs pending (Rs.)</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={feeCollection}>
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
          <Legend />
          <Bar dataKey="collected" fill="oklch(0.55 0.22 280)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="pending" fill="oklch(0.78 0.16 75)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

