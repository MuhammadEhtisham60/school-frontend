import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Wallet, TrendingUp, AlertCircle, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { students } from "@/data/mock-data";
import { StatusBadge } from "@/components/shared/ListToolbar";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { feeCollection } from "@/data/mock-data";

function FeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Fees"
        description="Collection overview and student-wise fee status."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Collected (MTD)"
          value="Rs. 8.1M"
          icon={Wallet}
          variant="success"
          trend={6}
        />
        <StatCard
          label="Pending"
          value="Rs. 920K"
          icon={AlertCircle}
          variant="warning"
          trend={-2}
        />
        <StatCard label="Avg Ticket" value="Rs. 12,400" icon={CreditCard} variant="info" />
        <StatCard label="Growth" value="+18%" icon={TrendingUp} variant="primary" trend={18} />
      </div>
      <Card className="p-6 shadow-card">
        <h3 className="font-semibold text-lg mb-4">Monthly Collection</h3>
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
            <Bar dataKey="collected" fill="oklch(0.55 0.22 280)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>
                  {s.class}-{s.section}
                </TableCell>
                <TableCell>Rs. 12,500</TableCell>
                <TableCell>
                  <StatusBadge status={s.feeStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                    Collect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default FeesPage;
