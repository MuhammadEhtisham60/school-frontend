import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton, CancelButton, SubmitButton } from "@/components/common/buttons";
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
import { BookOpenCheck, Layers, Users, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { label: "Total Subjects", value: "28", icon: BookOpenCheck, color: "text-blue-500" },
  { label: "Departments", value: "6", icon: Layers, color: "text-violet-500" },
  { label: "Assigned Teachers", value: "42", icon: Users, color: "text-emerald-500" },
  { label: "Classes Covered", value: "12", icon: GraduationCap, color: "text-amber-500" },
];
function SubjectsPage() {
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState([
    {
      name: "Mathematics",
      department: "Science",
      classes: "VI - XII",
      teacher: "Mr. Sharma",
      code: "MATH",
    },
    {
      name: "English",
      department: "Languages",
      classes: "I - XII",
      teacher: "Ms. Patel",
      code: "ENG",
    },
    {
      name: "Physics",
      department: "Science",
      classes: "IX - XII",
      teacher: "Dr. Kumar",
      code: "PHY",
    },
    {
      name: "History",
      department: "Humanities",
      classes: "VI - X",
      teacher: "Mrs. Singh",
      code: "HIST",
    },
    {
      name: "Computer Science",
      department: "Technology",
      classes: "VIII - XII",
      teacher: "Mr. Verma",
      code: "CS",
    },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubjects((prev) => [
      {
        name: fd.get("name"),
        department: fd.get("department"),
        classes: fd.get("classes"),
        teacher: fd.get("teacher"),
        code: fd.get("code"),
      },
      ...prev,
    ]);
    toast.success("Subject added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Subjects"
        description="Manage subjects, assign teachers and map to classes"
        eyebrow="Academics"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <PrimaryButton startIcon={<Plus className="h-4 w-4" />}>
                Add Subject
              </PrimaryButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input name="name" placeholder="e.g. Mathematics" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input name="code" placeholder="e.g. MATH101" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select name="department" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Languages">Languages</SelectItem>
                        <SelectItem value="Humanities">Humanities</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned Teacher</Label>
                    <Input name="teacher" placeholder="Teacher name" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Classes</Label>
                    <Input name="classes" placeholder="e.g. VI - XII" required />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <CancelButton>
                      Cancel
                    </CancelButton>
                  </DialogClose>
                  <SubmitButton>
                    Save Subject
                  </SubmitButton>
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
          <CardTitle>Subject List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjects.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.department} · {s.classes} · {s.code}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{s.teacher}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubjectsPage;
