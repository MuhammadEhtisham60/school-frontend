import { PageHeader } from "@/layout/PageHeader";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  BookOpen,
  Wallet,
  UserPlus,
  Download,
  ArrowRight,
  CircleDot,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  admissionTrends,
  roleDistribution,
  teacherDistribution,
  feeCollection,
  recentActivity,
} from "@/data/mock-data";
import { Link } from "react-router-dom";

const PIE_COLORS = [
  "oklch(0.55 0.22 280)",
  "oklch(0.7 0.18 320)",
  "oklch(0.65 0.18 200)",
  "oklch(0.72 0.16 155)",
];
function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Welcome back"
        title="School Dashboard"
        description="Real-time insights across admissions, academics, finance and people."
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              asChild
              className="gap-2 gradient-primary text-primary-foreground shadow-glow border-0"
            >
              <Link to="/admission">
                <UserPlus className="h-4 w-4" /> New Admission
              </Link>
            </Button>
          </>
        }
      />

      {/* Hero banner */}
      <Card className="relative overflow-hidden border-0 p-6 md:p-8 gradient-hero text-white shadow-glow">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, white, transparent 35%)",
          }}
        />
        <div className="relative grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur">
              Academic Session 2024 – 2025
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mt-3">
              Admissions are open · 248 new students this term
            </h2>
            <p className="text-white/85 mt-2 max-w-xl">
              Track every applicant from enquiry to enrollment. Beautiful, fast, and built for your
              team.
            </p>
            <div className="flex gap-2 mt-5">
              <Button
                asChild
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 border-0"
              >
                <Link to="/admission">
                  Start admission <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              >
                <Link to="/students">View students</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              { k: "Today's Enquiries", v: "27" },
              { k: "Pending Approvals", v: "08" },
              { k: "Active Classes", v: "42" },
              { k: "Staff Online", v: "61" },
            ].map((i) => (
              <div
                key={i.k}
                className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-3"
              >
                <p className="text-xs text-white/80">{i.k}</p>
                <p className="text-2xl font-bold mt-1">{i.v}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value="1,245"
          icon={GraduationCap}
          trend={12}
          variant="primary"
          sub="vs 1,112 last year"
        />
        <StatCard
          label="Total Teachers"
          value="78"
          icon={BookOpen}
          trend={4}
          variant="info"
          sub="6 new hires this term"
        />
        <StatCard
          label="Active Users"
          value="1,359"
          icon={Users}
          trend={8}
          variant="success"
          sub="across all roles"
        />
        <StatCard
          label="Fees Collected"
          value="Rs. 8.1M"
          icon={Wallet}
          trend={-3}
          variant="warning"
          sub="Aug 2024"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
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
                    style={{ background: PIE_COLORS[i] }}
                  />
                  {r.name}
                </div>
                <span className="font-semibold">{r.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
      </div>

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
    </div>
  );
}

export default Dashboard;
