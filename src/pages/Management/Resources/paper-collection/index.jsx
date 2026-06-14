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
import { FileStack, BookOpen, Calendar, Download, Plus } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { label: "Total Papers", value: "342", icon: FileStack, color: "text-blue-500" },
  { label: "Subjects", value: "18", icon: BookOpen, color: "text-violet-500" },
  { label: "Academic Years", value: "5", icon: Calendar, color: "text-emerald-500" },
  { label: "Downloads", value: "2,840", icon: Download, color: "text-amber-500" },
];
function PaperCollectionPage() {
  const [open, setOpen] = useState(false);
  const [papers, setPapers] = useState([
    { subject: "Mathematics", year: "2025-26", type: "Mid-Term", class: "Class X" },
    { subject: "Physics", year: "2025-26", type: "Final", class: "Class XII" },
    { subject: "English", year: "2025-26", type: "Unit Test", class: "Class VIII" },
    { subject: "Chemistry", year: "2024-25", type: "Final", class: "Class XI" },
    { subject: "Biology", year: "2024-25", type: "Mid-Term", class: "Class IX" },
    { subject: "Computer Science", year: "2025-26", type: "Practical", class: "Class XII" },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPapers((prev) => [
      {
        subject: fd.get("subject"),
        year: fd.get("year"),
        type: fd.get("type"),
        class: fd.get("class"),
      },
      ...prev,
    ]);
    toast.success("Paper added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Paper Collection"
        description="Archive of question papers across all subjects and years"
        eyebrow="Resources"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Paper
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Question Paper</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input name="subject" placeholder="e.g. Mathematics" required />
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
                    <Label>Academic Year</Label>
                    <Select name="year" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2022-23">2022-23</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label>Upload Paper (PDF)</Label>
                    <Input name="file" type="file" accept=".pdf,.doc,.docx" />
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
                    Save Paper
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
          <CardTitle>Recent Papers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {papers.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
              >
                <div>
                  <p className="font-medium">{p.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.class} · {p.year}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {p.type}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaperCollectionPage;
