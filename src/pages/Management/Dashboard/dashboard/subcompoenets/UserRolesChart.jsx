import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { roleDistribution } from "@/data/mock-data";

const PIE_COLORS = [
  "oklch(0.55 0.22 280)",
  "oklch(0.7 0.18 320)",
  "oklch(0.65 0.18 200)",
  "oklch(0.72 0.16 155)",
];

export function UserRolesChart() {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-semibold text-lg">User Roles</h3>
      <p className="text-sm text-muted-foreground mb-4">Distribution across system</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={roleDistribution}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {roleDistribution.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {roleDistribution.map((r, i) => (
          <div key={r.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              {r.name}
            </div>
            <span className="font-semibold">{r.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

