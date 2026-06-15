import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetStudentsQuery,
  useDeleteStudentMutation,
} from "@/services/private/studentService";
import { Pencil, Trash2, Eye, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/stat-card";

const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = import.meta.env.VITE_APP_API_URL
    ? import.meta.env.VITE_APP_API_URL.replace("/api/", "")
    : "http://localhost:5000";
  return `${baseUrl}${path}`;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  // Delete States
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data, isLoading, error } = useGetStudentsQuery({
    search: search || undefined,
    class: classFilter !== "all" ? classFilter : undefined,
    section: sectionFilter !== "all" ? sectionFilter : undefined,
  });

  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const studentsList = data?.students || [];

  const total = studentsList.length;
  const active = studentsList.filter((s) => (s.status || "Active") === "Active").length;
  const fees = studentsList.filter((s) => (s.feeStatus || "Paid") === "Paid").length;

  const triggerDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent(deleteId).unwrap();
      toast.success(`${deleteName} deleted successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || `Failed to delete ${deleteName}`);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      setDeleteName("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Students"
        description="Browse, search and manage every enrolled student."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={total} icon={GraduationCap} variant="primary" />
        <StatCard label="Active" value={active} icon={GraduationCap} variant="success" />
        <StatCard label="Fees Paid" value={fees} icon={GraduationCap} variant="info" />
        <StatCard
          label="Pending Fees"
          value={total - fees}
          icon={GraduationCap}
          variant="warning"
        />
      </div>

      <ListToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => navigate("/admission")}
        addLabel="Admit Student"
      >
        <div className="flex flex-wrap gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((c) => (
                <SelectItem key={c} value={c}>
                  Class {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {["A", "B", "C", "D"].map((s) => (
                <SelectItem key={s} value={s}>
                  Section {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ListToolbar>

      {isLoading ? (
        <Card className="p-12 flex justify-center items-center shadow-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading student directory...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive shadow-card">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load students</p>
            <p className="text-sm opacity-90">{error?.data?.message || "An unexpected error occurred"}</p>
          </div>
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsList.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                        <AvatarImage src={getMediaUrl(s.photo)} />
                        <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(s.fullName || s.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{s.fullName || s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.gender} · {s.dob || "No DOB"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">#{s.rollNo || "N/A"}</TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {s.class}-{s.section}
                    </span>
                  </TableCell>
                  <TableCell>{s.fatherName}</TableCell>
                  <TableCell className="text-sm">{s.mobile || s.contact || "N/A"}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.feeStatus || "Paid"} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status || "Active"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/students/details/${s.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/admission/${s.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => triggerDelete(s.id, s.fullName || s.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {studentsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student profile for <strong>{deleteName}</strong> and remove their record from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StudentsPage;
