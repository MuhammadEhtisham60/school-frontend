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
import { Plus } from "lucide-react";
import { toast } from "sonner";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [
  "08:00 - 08:45",
  "08:45 - 09:30",
  "09:45 - 10:30",
  "10:30 - 11:15",
  "11:30 - 12:15",
  "12:15 - 01:00",
];
const schedule = {
  Monday: ["Mathematics", "English", "Physics", "Chemistry", "Computer", "Library"],
  Tuesday: ["English", "Biology", "Mathematics", "History", "Geography", "PT"],
  Wednesday: ["Physics", "Mathematics", "English", "Computer", "Chemistry", "Art"],
  Thursday: ["Chemistry", "History", "Biology", "Mathematics", "English", "Music"],
  Friday: ["Mathematics", "Computer", "English", "Physics", "Biology", "Games"],
  Saturday: ["English", "Mathematics", "Geography", "Art", "PT", "—"],
};
function ClassRoutinePage() {
  const [open, setOpen] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Routine period added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Class Routine"
        description="Weekly class schedule and period management"
        eyebrow="Academics"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Period
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Period</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label>Section</Label>
                    <Select name="section" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select name="day" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
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
                    <Label>Start Time</Label>
                    <Input name="start" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input name="end" type="time" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Teacher</Label>
                    <Input name="teacher" placeholder="Teacher name" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Room / Hall</Label>
                    <Input name="room" placeholder="e.g. Room 101" />
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
                    Save Period
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle>Weekly Schedule — Class X-A</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Day</th>
                  {periods.map((p) => (
                    <th
                      key={p}
                      className="text-center px-3 py-3 font-medium text-muted-foreground text-xs"
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr
                    key={day}
                    className="border-b last:border-0 border-border/50 hover:bg-muted/20 transition-smooth"
                  >
                    <td className="px-4 py-3 font-semibold">{day}</td>
                    {schedule[day].map((sub, i) => (
                      <td key={i} className="text-center px-3 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${sub === "—" ? "text-muted-foreground" : "bg-primary/10 text-primary"}`}
                        >
                          {sub}
                        </span>
                      </td>
                    ))}
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

export default ClassRoutinePage;
