import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  TrendingUp,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Star,
  Trophy,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { subject: "Math", average: 85, top: 98 },
  { subject: "Science", average: 78, top: 95 },
  { subject: "English", average: 82, top: 96 },
  { subject: "History", average: 75, top: 92 },
  { subject: "Physics", average: 80, top: 99 },
  { subject: "Chemistry", average: 72, top: 94 },
];
const recentResults = [
  {
    id: "1",
    student: "Sarah Jenkins",
    class: "X-A",
    exam: "Mid-Term",
    score: "94%",
    status: "Distinction",
    rank: 1,
  },
  {
    id: "2",
    student: "Michael Chen",
    class: "X-A",
    exam: "Mid-Term",
    score: "88%",
    status: "First Class",
    rank: 5,
  },
  {
    id: "3",
    student: "Emma Wilson",
    class: "X-B",
    exam: "Mid-Term",
    score: "76%",
    status: "Second Class",
    rank: 12,
  },
  {
    id: "4",
    student: "James Rodriquez",
    class: "IX-C",
    exam: "Unit Test",
    score: "92%",
    status: "Distinction",
    rank: 2,
  },
  {
    id: "5",
    student: "Priya Sharma",
    class: "XII-A",
    exam: "Final",
    score: "96%",
    status: "Distinction",
    rank: 1,
  },
];
const stats = [
  {
    label: "Overall Pass Rate",
    value: "98.2%",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Average Grade",
    value: "A- (84%)",
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Distinctions",
    value: "42 Students",
    icon: Award,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Top Performer",
    value: "Sarah J.",
    icon: Trophy,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];
function ResultPage() {
  const [search, setSearch] = useState("");
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Academics"
        title="Result Management"
        description="Track student performance, publish marks and analyze academic trends."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" /> Print Reports
            </Button>
            <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
              <Download className="h-4 w-4" /> Export All
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="glass-card overflow-hidden border-0 shadow-sm hover:shadow-md transition-smooth"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 glass-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>Average vs Top scores across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="subject"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="average" fill="oklch(0.55 0.22 280)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="top" fill="oklch(0.7 0.18 320)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_280)]" />
                <span>Average Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.7_0.18_320)]" />
                <span>Top Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toppers Card */}
        <Card className="glass-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Class Toppers
            </CardTitle>
            <CardDescription>Top performers from current term</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentResults
                .filter((r) => r.rank <= 2)
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                        {r.student.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.student}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.class} · Rank #{r.rank}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0">
                      {r.score}
                    </Badge>
                  </div>
                ))}
            </div>
            <div className="p-4">
              <Button variant="outline" className="w-full text-xs" size="sm">
                View All Hall of Fame <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table Section */}
      <Card className="glass-card border-0 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Result Publications</CardTitle>
            <CardDescription>Browse and manage student scores</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                className="pl-9 w-[200px] sm:w-[300px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Class</th>
                  <th className="px-6 py-4 font-medium">Examination</th>
                  <th className="px-6 py-4 font-medium text-center">Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentResults
                  .filter((r) => r.student.toLowerCase().includes(search.toLowerCase()))
                  .map((res) => (
                    <tr key={res.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-medium">{res.student}</td>
                      <td className="px-6 py-4">{res.class}</td>
                      <td className="px-6 py-4">{res.exam}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{res.score}</td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            res.status === "Distinction"
                              ? "bg-emerald-500/10 text-emerald-600 border-0"
                              : res.status === "First Class"
                                ? "bg-blue-500/10 text-blue-600 border-0"
                                : "bg-slate-500/10 text-slate-600 border-0"
                          }
                        >
                          {res.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultPage;
