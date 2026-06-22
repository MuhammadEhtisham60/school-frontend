import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton, CancelButton, SubmitButton } from "@/components/common/buttons";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  Layers,
  GraduationCap,
  Users,
  School,
  BookOpen,
  Loader2,
  AlertCircle,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  X,
  BookOpenCheck,
  Eye,
} from "lucide-react";
import {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} from "@/services/private/classService";
import { useGetStudentsQuery } from "@/services/private/studentService";
import { toast } from "sonner";

function ClassesPage() {
  const navigate = useNavigate();

  // Queries
  const { data: classesResponse, isLoading: isClassesLoading, error: classesError } = useGetClassesQuery();
  const { data: studentsResponse } = useGetStudentsQuery({ limit: 1000 });

  const classesList = classesResponse?.data || [];
  const studentsList = studentsResponse?.students || [];

  // Mutations
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form State
  const [selectedClass, setSelectedClass] = useState(null);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [classSubjects, setClassSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");

  // Enrolled students mapped by class name
  const classStudentCounts = useMemo(() => {
    const counts = {};
    studentsList.forEach((student) => {
      const className = student.class;
      if (className) {
        counts[className] = (counts[className] || 0) + 1;
      }
    });
    return counts;
  }, [studentsList]);

  // Derive level description based on name
  const getLevelDetails = (name) => {
    const cleanName = name.toLowerCase().trim();
    if (cleanName === "nursery" || cleanName === "kg") {
      return {
        type: "Early Childhood Education",
        color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400",
      };
    }
    const num = parseInt(cleanName, 10);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 5) {
        return {
          type: "Primary Education",
          color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
        };
      }
      if (num >= 6 && num <= 8) {
        return {
          type: "Middle School",
          color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
        };
      }
      if (num >= 9 && num <= 10) {
        return {
          type: "High School (Matriculation)",
          color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
        };
      }
      if (num >= 11 && num <= 12) {
        return {
          type: "Higher Secondary (Intermediate)",
          color: "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400",
        };
      }
    }
    return {
      type: "General Academics",
      color: "from-blue-500/10 to-violet-500/10 text-blue-600 dark:text-blue-400",
    };
  };

  const totalClasses = classesList.length;
  const totalStudents = studentsList.length;
  const avgStudents = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
  
  const earlyChildhoodCount = classesList.filter(
    (c) => c.name.toLowerCase() === "nursery" || c.name.toLowerCase() === "kg"
  ).length;

  // Form Handlers
  const resetForm = () => {
    setSelectedClass(null);
    setName("");
    setDisplayOrder("");
    setIsActive(true);
    setClassSubjects([]);
    setSubjectInput("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedClass(c);
    setName(c.name || "");
    setDisplayOrder(c.displayOrder !== undefined && c.displayOrder !== null ? String(c.displayOrder) : "");
    setIsActive(c.isActive !== undefined ? c.isActive : true);
    setClassSubjects(c.subjects || []);
    setSubjectInput("");
    setIsEditOpen(true);
  };

  const handleOpenDelete = (c) => {
    setSelectedClass(c);
    setIsDeleteOpen(true);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    const val = subjectInput.trim();
    if (val && !classSubjects.includes(val)) {
      setClassSubjects([...classSubjects, val]);
      setSubjectInput("");
    }
  };

  const handleRemoveSubject = (sub) => {
    setClassSubjects(classSubjects.filter((s) => s !== sub));
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      displayOrder: displayOrder.trim() ? Number(displayOrder) : undefined,
      isActive,
      subjects: classSubjects,
    };

    try {
      await createClass(payload).unwrap();
      toast.success("Class created successfully!");
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create class");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      displayOrder: displayOrder.trim() ? Number(displayOrder) : undefined,
      isActive,
      subjects: classSubjects,
    };

    try {
      await updateClass({ id: selectedClass.id, body: payload }).unwrap();
      toast.success("Class updated successfully!");
      setIsEditOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update class");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;
    try {
      await deleteClass(selectedClass.id).unwrap();
      toast.success("Class deleted successfully!");
      setIsDeleteOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete class");
    }
  };

  if (isClassesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading academic levels...</p>
      </div>
    );
  }

  if (classesError) {
    return (
      <Card className="p-8 border-destructive/20 bg-destructive/5 flex items-center gap-4 text-destructive shadow-card max-w-2xl mx-auto my-12">
        <AlertCircle className="h-8 w-8 animate-bounce" />
        <div>
          <h3 className="font-semibold text-lg">Failed to retrieve classes</h3>
          <p className="text-sm opacity-90 mt-1">
            {classesError?.data?.message || "Verify your connection or contact the administrator."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Academics"
        title="Classes Management"
        description="View and configure core academic classes, sections and student distributions."
        actions={
          <PrimaryButton startIcon={<Plus className="h-4 w-4" />} onClick={handleOpenAdd}>
            Add Class
          </PrimaryButton>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Classes"
          value={totalClasses}
          icon={Layers}
          variant="primary"
          sub="Configured levels"
        />
        <StatCard
          label="Total Enrolled"
          value={totalStudents}
          icon={GraduationCap}
          variant="success"
          sub="Across all classes"
        />
        <StatCard
          label="Avg Student Density"
          value={`${avgStudents} Students`}
          icon={Users}
          variant="info"
          sub="Per academic level"
        />
        <StatCard
          label="Early Childhood"
          value={earlyChildhoodCount}
          icon={School}
          variant="warning"
          sub="Nursery & KG levels"
        />
      </div>

      <Card className="glass-card border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Academic Levels & Divisions</CardTitle>
              <CardDescription>
                Currently active classes sorted by system-defined display order
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {classesList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No classes configured yet. Click "Add Class" to create one.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classesList.map((c) => {
                const details = getLevelDetails(c.name);
                const studentCount = classStudentCounts[c.name] || 0;

                return (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-5 rounded-2xl glass-card border border-border/50 card-hover relative group"
                  >
                    {/* Subtle Background Glow on Hover */}
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300 pointer-events-none" />
                    
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${details.color} border-0 shadow-sm`}>
                          {details.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${c.isActive ? 'bg-success' : 'bg-destructive'}`} />
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Class Name */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />{c.name}
                        </h3>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Order: {c.displayOrder}
                        </span>
                      </div>

                      {/* Associated Subjects */}
                      <div className="mb-6 space-y-1.5">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1 mb-2">
                          <BookOpenCheck className="h-3 w-3 text-muted-foreground" /> Assigned Subjects ({c.subjects?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {c.subjects && c.subjects.length > 0 ? (
                            c.subjects.map((s, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] font-medium py-0 px-2 border-border/70">
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No subjects assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Stats and Action */}
                    <div className="border-t border-border/50 pt-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Enrolled Students
                          </p>
                          <p className="text-sm font-extrabold text-foreground mt-0.5">
                            {studentCount} {studentCount === 1 ? "Student" : "Students"}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary-glow font-semibold text-xs gap-1 group-hover:translate-x-1 transition-all duration-300 px-2.5 h-8"
                          onClick={() => navigate(`/students?class=${encodeURIComponent(c.name)}`)}
                        >
                          View Students <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => navigate(`/classes/${c.id}`)}
                          title="View Class details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Class Details"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleOpenDelete(c)}
                          title="Delete Class"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Class Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name">Class Name *</Label>
              <Input
                id="add-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nursery, KG, 1, 2, 13"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-order">Display Order</Label>
              <Input
                id="add-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="e.g. 1, 2, 15"
                min="0"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="add-active">Is Active</Label>
                <p className="text-xs text-muted-foreground">Makes this class selection visible in dropdowns.</p>
              </div>
              <input
                id="add-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 accent-primary cursor-pointer rounded"
              />
            </div>

            {/* Subject Association */}
            <div className="space-y-2 pt-2 border-t">
              <Label>Assigned Subjects</Label>
              <div className="flex gap-2">
                <Input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. Mathematics"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubject(e);
                    }
                  }}
                />
                <Button type="button" variant="outline" className="h-10 px-3 shrink-0" onClick={handleAddSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {classSubjects.map((sub, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1 text-xs">
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub)}
                      className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {classSubjects.length === 0 && (
                  <span className="text-[11px] text-muted-foreground italic">No subjects added yet</span>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-4">
              <DialogClose asChild>
                <CancelButton type="button" disabled={isCreating}>Cancel</CancelButton>
              </DialogClose>
              <SubmitButton disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Class
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Class Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1 mb-2">
              <p><strong>System Slug:</strong> {selectedClass?.id}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Class Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nursery, KG, 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
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
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 accent-primary cursor-pointer rounded"
              />
            </div>

            {/* Subject Association */}
            <div className="space-y-2 pt-2 border-t">
              <Label>Assigned Subjects</Label>
              <div className="flex gap-2">
                <Input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. Mathematics"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubject(e);
                    }
                  }}
                />
                <Button type="button" variant="outline" className="h-10 px-3 shrink-0" onClick={handleAddSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {classSubjects.map((sub, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1 text-xs">
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub)}
                      className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {classSubjects.length === 0 && (
                  <span className="text-[11px] text-muted-foreground italic">No subjects added yet</span>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-4">
              <DialogClose asChild>
                <CancelButton type="button" disabled={isUpdating}>Cancel</CancelButton>
              </DialogClose>
              <SubmitButton disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the class <strong>Class {selectedClass?.name}</strong>.
              Students currently assigned to this class will remain in the database but may not filter properly until reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={resetForm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ClassesPage;
