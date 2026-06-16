import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton, CancelButton, SubmitButton } from "@/components/common/buttons";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  BookOpenCheck,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { useGetClassByIdQuery, useUpdateClassMutation } from "@/services/private/classService";
import { useGetStudentsQuery } from "@/services/private/studentService";
import { toast } from "sonner";

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

export default function ClassDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentSearch, setStudentSearch] = useState("");
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [updateClass, { isLoading: isUpdatingClass }] = useUpdateClassMutation();

  // Queries
  const { data: classResponse, isLoading: isClassLoading, error: classError } = useGetClassByIdQuery(id);
  const classData = classResponse?.data;

  const { data: studentsResponse, isLoading: isStudentsLoading } = useGetStudentsQuery(
    { class: classData?.name },
    { skip: !classData?.name }
  );
  const studentsList = studentsResponse?.students || [];

  // Edit Class Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSubjects, setEditSubjects] = useState([]);
  const [editSubjectInput, setEditSubjectInput] = useState("");

  const handleOpenEdit = () => {
    if (!classData) return;
    setEditName(classData.name || "");
    setEditDisplayOrder(classData.displayOrder !== undefined && classData.displayOrder !== null ? String(classData.displayOrder) : "");
    setEditIsActive(classData.isActive !== undefined ? classData.isActive : true);
    setEditSubjects(classData.subjects || []);
    setEditSubjectInput("");
    setIsEditOpen(true);
  };

  const handleAddEditSubject = (e) => {
    e.preventDefault();
    const val = editSubjectInput.trim();
    if (val && !editSubjects.includes(val)) {
      setEditSubjects([...editSubjects, val]);
      setEditSubjectInput("");
    }
  };

  const handleRemoveEditSubject = (sub) => {
    setEditSubjects(editSubjects.filter((s) => s !== sub));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Class name is required");
      return;
    }

    const payload = {
      name: editName.trim(),
      displayOrder: editDisplayOrder.trim() ? Number(editDisplayOrder) : undefined,
      isActive: editIsActive,
      subjects: editSubjects,
    };

    try {
      await updateClass({ id: classData.id, body: payload }).unwrap();
      toast.success("Class details updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update class details");
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const subName = newSubjectName.trim();
    if (!subName) return;

    if (classData?.subjects?.includes(subName)) {
      toast.error("Subject already exists in this class");
      return;
    }

    const payload = {
      name: classData.name,
      displayOrder: classData.displayOrder,
      isActive: classData.isActive,
      subjects: [...(classData.subjects || []), subName],
    };

    try {
      await updateClass({ id: classData.id, body: payload }).unwrap();
      toast.success("Subject added successfully!");
      setIsAddSubjectOpen(false);
      setNewSubjectName("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add subject");
    }
  };

  // Filter students locally based on search input
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const name = s.fullName || s.name || "";
      const fatherName = s.fatherName || "";
      const rollNo = s.rollNo || "";
      return (
        name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        fatherName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        rollNo.toLowerCase().includes(studentSearch.toLowerCase())
      );
    });
  }, [studentsList, studentSearch]);

  if (isClassLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading class details...</p>
      </div>
    );
  }

  if (classError || !classData) {
    return (
      <Card className="p-8 border-destructive/20 bg-destructive/5 flex items-center gap-4 text-destructive shadow-card max-w-2xl mx-auto my-12">
        <AlertCircle className="h-8 w-8 animate-bounce" />
        <div>
          <h3 className="font-semibold text-lg">Failed to retrieve class details</h3>
          <p className="text-sm opacity-90 mt-1">
            {classError?.data?.message || "Verify the URL ID or connection."}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/classes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classes
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/classes")} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classes
        </Button>
      </div>

      <PageHeader
        eyebrow="Class Overview"
        title={`${classData.name}`}
        description={`Detailed record of enrolled students and assigned subjects for ${classData.name}.`}
        actions={
          <Button onClick={handleOpenEdit} variant="outline" className="gap-1.5 h-9 text-xs font-semibold">
            <Pencil className="h-4 w-4" /> Edit Class
          </Button>
        }
      />

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Enrolled Students"
          value={studentsList.length}
          icon={GraduationCap}
          variant="success"
          sub="Active & Inactive students"
        />
        <StatCard
          label="Assigned Subjects"
          value={classData.subjects?.length || 0}
          icon={BookOpen}
          variant="primary"
          sub="Curriculum modules"
        />
        <StatCard
          label="Class Status"
          value={classData.isActive ? "Active" : "Inactive"}
          icon={Layers}
          variant="info"
          sub="Visibility in system drop-downs"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subjects Card */}
        <Card className="glass-card lg:col-span-1 border-0 shadow-sm flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-primary" /> Curriculum Subjects
              </CardTitle>
              <CardDescription>Academic courses registered for this class</CardDescription>
            </div>
            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Add Subject">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Subject to Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubject} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-subject-name">Subject Name *</Label>
                    <Input
                      id="new-subject-name"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="e.g. Chemistry, Biology"
                      required
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-4">
                    <DialogClose asChild>
                      <CancelButton type="button" disabled={isUpdatingClass}>Cancel</CancelButton>
                    </DialogClose>
                    <SubmitButton disabled={isUpdatingClass}>
                      {isUpdatingClass && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Add Subject
                    </SubmitButton>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-wrap gap-2">
              {classData.subjects && classData.subjects.length > 0 ? (
                classData.subjects.map((sub, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs font-semibold">
                    {sub}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">No subjects assigned yet</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Directory Table Card */}
        <Card className="glass-card lg:col-span-2 border-0 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Enrolled Students Directory</CardTitle>
              <CardDescription>Directory of all students assigned to Class {classData.name}</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9 w-[200px]"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1">
            {isStudentsLoading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No students found matching the query in this class.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                            <AvatarImage src={getMediaUrl(s.photo)} />
                            <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                              {getInitials(s.fullName || s.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{s.fullName || s.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Section {s.section} · {s.gender}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">#{s.rollNo || "N/A"}</TableCell>
                      <TableCell>{s.fatherName}</TableCell>
                      <TableCell className="text-xs">{s.mobile || s.contact || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => navigate(`/students/details/${s.id}`)}
                          title="View Student Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Class Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1 mb-2">
              <p><strong>System Slug:</strong> {classData?.id}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Class Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Nursery, KG, 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                type="number"
                value={editDisplayOrder}
                onChange={(e) => setEditDisplayOrder(e.target.value)}
                placeholder="e.g. 1, 2"
                min="0"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="edit-active">Is Active</Label>
                <p className="text-xs text-muted-foreground">Makes this class selection visible in dropdowns.</p>
              </div>
              <input
                id="edit-active"
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-5 w-5 accent-primary cursor-pointer rounded"
              />
            </div>

            {/* Subject Association */}
            <div className="space-y-2 pt-2 border-t">
              <Label>Assigned Subjects</Label>
              <div className="flex gap-2">
                <Input
                  value={editSubjectInput}
                  onChange={(e) => setEditSubjectInput(e.target.value)}
                  placeholder="e.g. Mathematics"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEditSubject(e);
                    }
                  }}
                />
                <Button type="button" variant="outline" className="h-10 px-3 shrink-0" onClick={handleAddEditSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {editSubjects.map((sub, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1 text-xs">
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveEditSubject(sub)}
                      className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {editSubjects.length === 0 && (
                  <span className="text-[11px] text-muted-foreground italic">No subjects added yet</span>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-4">
              <DialogClose asChild>
                <CancelButton type="button" disabled={isUpdatingClass}>Cancel</CancelButton>
              </DialogClose>
              <SubmitButton disabled={isUpdatingClass}>
                {isUpdatingClass && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
