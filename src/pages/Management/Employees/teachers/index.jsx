import { useMemo, useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { teachers } from "@/data/mock-data";
import { Pencil, Trash2, Eye, BookOpen, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/stat-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function TeachersPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(
    () =>
      teachers.filter((t) => `${t.name} ${t.subject}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty"
        title="Teachers"
        description="Manage teacher profiles, subjects and assignments."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Teachers"
          value={teachers.length}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          label="Full-time"
          value={teachers.filter((t) => t.type === "Full-time").length}
          icon={BookOpen}
          variant="success"
        />
        <StatCard
          label="Part-time"
          value={teachers.filter((t) => t.type === "Part-time").length}
          icon={BookOpen}
          variant="info"
        />
        <StatCard
          label="On Leave"
          value={teachers.filter((t) => t.status === "Inactive").length}
          icon={BookOpen}
          variant="warning"
        />
      </div>

      <ListToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => setOpen(true)}
        addLabel="Add Teacher"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.id} className="p-5 card-hover shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full opacity-20 blur-2xl gradient-primary" />
            <div className="flex items-start gap-4 relative">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold truncate">{t.name}</h3>
                    <p className="text-sm text-primary font-medium">{t.subject}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.qualification} · {t.experience} yrs exp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="p-2 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="font-semibold">Rs. {t.salary.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-semibold">{t.type}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {t.classes.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="bg-accent text-accent-foreground border-0"
                >
                  Class {c}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {t.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {t.phone}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => toast.info(`Viewing ${t.name}`)}
              >
                <Eye className="h-3 w-3" /> View
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => toast.info(`Editing ${t.name}`)}
              >
                <Pencil className="h-3 w-3" /> Edit
              </Button>
              <Button size="icon" variant="ghost" onClick={() => toast.error(`Delete ${t.name}?`)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <TeacherDialog open={open} setOpen={setOpen} />
    </div>
  );
}
function TeacherDialog({ open, setOpen }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="e.g. Sara Mahmood" />
          </div>
          <div className="space-y-2">
            <Label>CNIC</Label>
            <Input placeholder="12345-1234567-1" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input placeholder="e.g. Mathematics" />
          </div>
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input placeholder="e.g. MSc Math" />
          </div>
          <div className="space-y-2">
            <Label>Experience (years)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>Salary</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" />
          </div>
          <div className="space-y-2">
            <Label>Joining Date</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ft">Full-time</SelectItem>
                <SelectItem value="pt">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              toast.success("Teacher added");
              setOpen(false);
            }}
          >
            Save Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TeachersPage;
