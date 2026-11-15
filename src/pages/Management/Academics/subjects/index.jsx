import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton, CancelButton, SubmitButton } from "@/components/common/buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "@/services/private/subjectService";
import { useGetTeachersDropdownQuery } from "@/services/private/teacherService";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import {
  BookOpenCheck,
  Layers,
  Users,
  GraduationCap,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  FileDown,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import { downloadSubjectsListPDF } from "@/utils/pdfGenerator";
import { downloadExcelFile } from "@/utils/excelExport";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Science",
  "Mathematics",
  "Languages",
  "Computer Science",
  "Humanities",
  "Islamiat & Urdu",
  "Commerce",
  "Arts",
  "Physical Education",
];

const SUBJECT_TYPES = ["Core", "Elective", "Practical"];

const DEFAULT_FORM = {
  name: "",
  code: "",
  department: "Science",
  subjectType: "Core",
  weeklyPeriods: 5,
  teacherId: "unassigned",
  classes: [],
  description: "",
  isActive: true,
};

function SubjectsPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: subjectsRes, isLoading, isError, refetch } = useGetSubjectsQuery();
  const { data: teachersRes } = useGetTeachersDropdownQuery();
  const { data: classesRes } = useGetClassesDropdownQuery();

  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

  const allSubjects = useMemo(
    () => subjectsRes?.data || subjectsRes?.subjects || [],
    [subjectsRes]
  );
  const teachersList = useMemo(() => teachersRes?.data || [], [teachersRes]);
  const classesList = useMemo(() => classesRes?.data || [], [classesRes]);

  const availableDepartments = useMemo(() => {
    const set = new Set(DEPARTMENTS);
    allSubjects.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [allSubjects]);

  const stats = useMemo(() => {
    const activeSubjects = allSubjects.filter((s) => s.isActive !== false).length;
    const uniqueDepts = new Set(allSubjects.map((s) => s.department).filter(Boolean)).size;
    const uniqueTeachers = new Set(
      allSubjects
        .map((s) => s.teacherId || s.teacher)
        .filter((v) => v && String(v).trim() !== "")
    ).size;
    const uniqueClasses = new Set();
    allSubjects.forEach((s) => {
      (Array.isArray(s.classes) ? s.classes : []).forEach((c) => uniqueClasses.add(String(c)));
    });

    return [
      {
        label: "Total Subjects",
        value: isLoading ? "..." : String(allSubjects.length),
        sub: `${activeSubjects} active · ${Math.max(0, allSubjects.length - activeSubjects)} inactive`,
        icon: BookOpenCheck,
        color: "text-blue-500",
      },
      {
        label: "Departments",
        value: isLoading ? "..." : String(uniqueDepts),
        sub: "Academic departments",
        icon: Layers,
        color: "text-violet-500",
      },
      {
        label: "Assigned Teachers",
        value: isLoading ? "..." : String(uniqueTeachers),
        sub: "Faculty teaching subjects",
        icon: Users,
        color: "text-emerald-500",
      },
      {
        label: "Classes Covered",
        value: isLoading ? "..." : String(uniqueClasses.size),
        sub: "Mapped grade levels",
        icon: GraduationCap,
        color: "text-amber-500",
      },
    ];
  }, [allSubjects, isLoading]);

  const filteredSubjects = useMemo(() => {
    return allSubjects.filter((s) => {
      if (deptFilter !== "all" && String(s.department).toLowerCase() !== deptFilter.toLowerCase()) {
        return false;
      }
      if (
        typeFilter !== "all" &&
        String(s.subjectType || "Core").toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return false;
      }
      if (statusFilter === "active" && s.isActive === false) return false;
      if (statusFilter === "inactive" && s.isActive !== false) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = String(s.name || "").toLowerCase().includes(q);
        const matchCode = String(s.code || "").toLowerCase().includes(q);
        const matchDept = String(s.department || "").toLowerCase().includes(q);
        const matchTeacher = String(s.teacher || s.teacherName || "").toLowerCase().includes(q);
        const matchClasses = (Array.isArray(s.classes) ? s.classes : [])
          .join(" ")
          .toLowerCase()
          .includes(q);
        if (!matchName && !matchCode && !matchDept && !matchTeacher && !matchClasses) {
          return false;
        }
      }
      return true;
    });
  }, [allSubjects, deptFilter, typeFilter, statusFilter, search]);

  const openCreateDialog = () => {
    setEditingSubject(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name || "",
      code: subject.code || "",
      department: subject.department || "Science",
      subjectType: subject.subjectType || "Core",
      weeklyPeriods: subject.weeklyPeriods ?? 5,
      teacherId: subject.teacherId ? String(subject.teacherId) : "unassigned",
      classes: Array.isArray(subject.classes) ? subject.classes.map(String) : [],
      description: subject.description || "",
      isActive: subject.isActive !== false,
    });
    setDialogOpen(true);
  };

  const toggleClassSelection = (className) => {
    const key = String(className);
    setForm((prev) => {
      const exists = prev.classes.includes(key);
      return {
        ...prev,
        classes: exists ? prev.classes.filter((c) => c !== key) : [...prev.classes, key],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Subject name and code are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      department: form.department,
      subjectType: form.subjectType,
      weeklyPeriods: Number(form.weeklyPeriods) || 5,
      teacherId: form.teacherId === "unassigned" ? null : form.teacherId,
      classes: form.classes,
      description: form.description.trim(),
      isActive: form.isActive,
    };

    try {
      if (editingSubject) {
        await updateSubject({ id: editingSubject.id, body: payload }).unwrap();
        toast.success("Subject updated successfully");
      } else {
        await createSubject(payload).unwrap();
        toast.success("Subject created successfully");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save subject");
    }
  };

  const handleToggleStatus = async (subject) => {
    try {
      await updateSubject({
        id: subject.id,
        body: { isActive: subject.isActive === false },
      }).unwrap();
      toast.success(
        `${subject.name} marked as ${subject.isActive === false ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update subject status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubject(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete subject");
    }
  };

  const isSaving = isCreating || isUpdating;

  const handleExportExcel = () => {
    downloadExcelFile({
      filename: `Subjects_List_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Subjects",
      title: "Academic Subjects Directory",
      headers: ["Code", "Subject Name", "Department", "Type", "Weekly Periods", "Classes", "Assigned Teacher", "Status"],
      rows: filteredSubjects.map((s) => [
        s.code || "",
        s.name || "",
        s.department || "",
        s.subjectType || "Core",
        s.weeklyPeriods ?? 5,
        Array.isArray(s.classes) ? s.classes.join(", ") : "",
        s.teacher || s.teacherName || "Unassigned",
        s.isActive === false ? "Inactive" : "Active",
      ]),
    });
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Subjects"
        description="Manage subjects, assign teachers and map to classes"
        eyebrow="Academics"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={filteredSubjects.length === 0}
              className="gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadSubjectsListPDF(filteredSubjects)}
              disabled={filteredSubjects.length === 0}
              className="gap-1.5"
            >
              <FileDown className="h-4 w-4 text-primary" /> PDF
            </Button>
            <PrimaryButton startIcon={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
              Add Subject
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card hover:shadow-lg transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Subject List</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filteredSubjects.length} of {allSubjects.length} subjects
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject, code, teacher..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {availableDepartments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[125px] h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SUBJECT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <p>Failed to load subjects.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <p>No subjects match your filters.</p>
              {(search || deptFilter !== "all" || typeFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setDeptFilter("all");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredSubjects.map((s) => {
                const isActive = s.isActive !== false;
                const classItems = Array.isArray(s.classes) ? s.classes : [];
                return (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/subjects/${s.id}`}
                          className="font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {s.name}
                        </Link>
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {s.code}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[11px] bg-primary/10 text-primary border-0"
                        >
                          {s.subjectType || "Core"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[11px] border-0 ${
                            isActive
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{s.department}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {s.weeklyPeriods ?? 5} periods/wk
                        </span>
                        <span>·</span>
                        <span>
                          Classes:{" "}
                          {classItems.length > 0 ? (
                            classItems.join(", ")
                          ) : (
                            <span className="italic">Not mapped</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="text-right">
                        {s.teacherId ? (
                          <Link
                            to={`/teachers/details/${s.teacherId}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {s.teacher || s.teacherName}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {s.teacher || s.teacherName || "Unassigned"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => handleToggleStatus(s)}
                          aria-label={`Toggle ${s.name} active status`}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View details">
                          <Link to={`/subjects/${s.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(s)}
                          title="Edit subject"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                          title="Delete subject"
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

      {/* Add / Edit Subject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Subject Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. MATH101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(val) => setForm((p) => ({ ...p, department: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject Type</Label>
                <Select
                  value={form.subjectType}
                  onValueChange={(val) => setForm((p) => ({ ...p, subjectType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assigned Teacher</Label>
                <Select
                  value={form.teacherId}
                  onValueChange={(val) => setForm((p) => ({ ...p, teacherId: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teachersList.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.fullName || t.name} {t.subject ? `(${t.subject})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Weekly Periods</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={form.weeklyPeriods}
                  onChange={(e) => setForm((p) => ({ ...p, weeklyPeriods: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Classes Covered</Label>
                {classesList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 rounded-lg border border-border p-2.5 bg-muted/20">
                    {classesList.map((cls) => {
                      const clsName = String(cls.name);
                      const selected = form.classes.includes(clsName);
                      return (
                        <button
                          key={cls.id || clsName}
                          type="button"
                          onClick={() => toggleClassSelection(clsName)}
                          className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground font-medium"
                              : "border-border bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Class {clsName}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    value={form.classes.join(", ")}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        classes: e.target.value
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean),
                      }))
                    }
                    placeholder="e.g. 6, 7, 8, 9, 10"
                  />
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief syllabus or curriculum notes..."
                />
              </div>

              {editingSubject && (
                <div className="flex items-center justify-between sm:col-span-2 rounded-lg border border-border px-3 py-2">
                  <div>
                    <Label className="text-sm">Active Subject</Label>
                    <p className="text-xs text-muted-foreground">
                      Inactive subjects are hidden from active curriculum lists
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <CancelButton type="button" onClick={() => setDialogOpen(false)}>
                Cancel
              </CancelButton>
              <SubmitButton disabled={isSaving}>
                {isSaving ? "Saving..." : editingSubject ? "Update Subject" : "Save Subject"}
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span> (
              {deleteTarget?.code})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SubjectsPage;
