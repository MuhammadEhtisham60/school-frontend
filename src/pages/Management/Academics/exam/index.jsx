import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CalendarCheck, Users, Award, Plus } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { label: "Upcoming Exams", value: "3", icon: CalendarCheck, color: "text-blue-500" },
  { label: "Completed", value: "12", icon: FileText, color: "text-emerald-500" },
  { label: "Students Enrolled", value: "485", icon: Users, color: "text-violet-500" },
  { label: "Results Published", value: "10", icon: Award, color: "text-amber-500" },
];
function ExamPage() {
  const [open, setOpen] = useState(false);
  const [exams, setExams] = useState([
    {
      name: "Mid-Term Examination",
      class: "Class X",
      date: "2026-05-15",
      subject: "All Subjects",
      type: "Mid-Term",
    },
    {
      name: "Unit Test - Physics",
      class: "Class XII",
      date: "2026-05-20",
      subject: "Physics",
      type: "Unit Test",
    },
    {
      name: "Final Exam - Mathematics",
      class: "Class IX",
      date: "2026-06-01",
      subject: "Mathematics",
      type: "Final",
    },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setExams((prev) => [
      {
        name: fd.get("name"),
        class: fd.get("class"),
        date: fd.get("date"),
        subject: fd.get("subject"),
        type: fd.get("type"),
      },
      ...prev,
    ]);
    toast.success("Exam added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Exam Management"
        description="Schedule, manage and publish exam results"
        eyebrow="Academics"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Exam</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Exam Name</Label>
                    <Input name="name" placeholder="e.g. Mid-Term Examination" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select name="class" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Class I",
                          "Class II",
                          "Class III",
                          "Class IV",
                          "Class V",
                          "Class VI",
                          "Class VII",
                          "Class VIII",
                          "Class IX",
                          "Class X",
                          "Class XI",
                          "Class XII",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input name="subject" placeholder="e.g. Mathematics" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unit Test">Unit Test</SelectItem>
                        <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="Practical">Practical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input name="marks" type="number" placeholder="e.g. 100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (mins)</Label>
                    <Input name="duration" type="number" placeholder="e.g. 180" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Instructions</Label>
                    <Textarea name="instructions" placeholder="Exam instructions (optional)" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="gradient-primary text-primary-foreground border-0"
                  >
                    Save Exam
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card hover:shadow-lg transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Exam Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exams.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
              >
                <div>
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.class} · {ex.subject} · {ex.date}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {ex.type}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExamPage;
