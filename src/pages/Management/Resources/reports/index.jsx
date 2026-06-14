import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { BarChart3, FileText, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  {
    title: "Admission Report",
    desc: "Monthly admissions breakdown by class and section.",
    icon: TrendingUp,
  },
  {
    title: "Attendance Summary",
    desc: "Daily / weekly / monthly attendance analytics.",
    icon: BarChart3,
  },
  {
    title: "Fee Collection Report",
    desc: "Collected vs outstanding fees by class.",
    icon: FileText,
  },
  { title: "Teacher Performance", desc: "Workload, classes handled and ratings.", icon: BarChart3 },
  { title: "Student Progress", desc: "Academic progress and grade trends.", icon: TrendingUp },
  {
    title: "Annual Statement",
    desc: "End-of-year financial and academic summary.",
    icon: FileText,
  },
];
function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Generate and export detailed reports across modules."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title} className="p-6 card-hover shadow-card relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full opacity-15 blur-2xl gradient-primary" />
            <div className="relative">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <r.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mt-4">{r.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1">
                  Preview
                </Button>
                <Button className="flex-1 gradient-primary text-primary-foreground border-0 gap-2">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;
