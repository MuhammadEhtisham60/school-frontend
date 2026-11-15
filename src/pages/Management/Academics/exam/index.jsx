import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
} from "@/services/private/examService";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetSubjectsQuery } from "@/services/private/subjectService";
import { useGetStudentsQuery } from "@/services/private/studentService";
import {
  FileText,
  CalendarCheck,
  Users,
  Award,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  FileDown,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import { downloadExamsListPDF } from "@/utils/pdfGenerator";
import { downloadExcelFile } from "@/utils/excelExport";
import { toast } from "sonner";

const EXAM_TYPES = ["Unit Test", "Mid-Term", "Final", "Practical"];
const EXAM_STATUSES = ["Scheduled", "Completed", "Cancelled"];

const DEFAULT_FORM = {
  name: "",
  className: "",
  subject: "All Subjects",
  examType: "Mid-Term",
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  marks: 100,
  passingMarks: 40,
  duration: 180,
  room: "",
  status: "Scheduled",
  resultsPublished: false,
  instructions: "",
};

function ExamPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: examsRes, isLoading, isError, refetch } = useGetExamsQuery();
  const { data: classesRes } = useGetClassesDropdownQuery();
  const { data: subjectsRes } = useGetSubjectsQuery();
  const { data: studentsRes } = useGetStudentsQuery({ limit: 1000 });

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();

  const allExams = useMemo(() => examsRes?.data || examsRes?.exams || [], [examsRes]);
  const classesList = useMemo(() => classesRes?.data || [], [classesRes]);
  const subjectsList = useMemo(
    () => (subjectsRes?.data || subjectsRes?.subjects || []).filter((s) => s.isActive !== false),
    [subjectsRes]
  );

  const stats = useMemo(() => {
    const upcomingCount = allExams.filter(
      (ex) => String(ex.status || "Scheduled").toLowerCase() === "scheduled"
    ).length;
    const completedCount = allExams.filter(
      (ex) => String(ex.status || "").toLowerCase() === "completed"
    ).length;
    const publishedCount = allExams.filter((ex) => ex.resultsPublished === true).length;

    const students = studentsRes?.students || [];
    const activeStudentsCount = students.filter((s) => s.is_active !== false).length;
    const enrolledTotal = studentsRes?.total ?? activeStudentsCount;

    return [
      {
        label: "Upcoming Exams",
        value: isLoading ? "..." : String(upcomingCount),
        sub: `${allExams.length} total scheduled`,
        icon: CalendarCheck,
        color: "text-blue-500",
      },
      {
        label: "Completed",
        value: isLoading ? "..." : String(completedCount),
        sub: "Exams conducted",
        icon: FileText,
        color: "text-emerald-500",
      },
      {
        label: "Students Enrolled",
        value: isLoading ? "..." : enrolledTotal.toLocaleString(),
        sub: "Active student body",
        icon: Users,
        color: "text-violet-500",
      },
      {
        label: "Results Published",
        value: isLoading ? "..." : String(publishedCount),
        sub: `${Math.max(0, completedCount - publishedCount)} pending publish`,
        icon: Award,
        color: "text-amber-500",
      },
    ];
  }, [allExams, studentsRes, isLoading]);

  const filteredExams = useMemo(() => {
    return allExams.filter((ex) => {
      if (classFilter !== "all" && String(ex.className).toLowerCase() !== classFilter.toLowerCase()) {
        return false;
      }
      if (
        typeFilter !== "all" &&
        String(ex.examType || ex.type).toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return false;
      }
      if (
        statusFilter !== "all" &&
        String(ex.status || "Scheduled").toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          String(ex.name || "").toLowerCase().includes(q) ||
          String(ex.className || "").toLowerCase().includes(q) ||
          String(ex.subject || "").toLowerCase().includes(q) ||
          String(ex.room || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allExams, classFilter, typeFilter, statusFilter, search]);

  const openCreateDialog = () => {
    setEditingExam(null);
    setForm({
      ...DEFAULT_FORM,
      className: classesList[0]?.name ? String(classesList[0].name) : "10",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (exam) => {
    setEditingExam(exam);
    setForm({
      name: exam.name || "",
      className: exam.className || "",
      subject: exam.subject || "All Subjects",
      examType: exam.examType || exam.type || "Mid-Term",
      date: exam.date || new Date().toISOString().split("T")[0],
      startTime: exam.startTime || "09:00",
      marks: exam.marks ?? exam.totalMarks ?? 100,
      passingMarks: exam.passingMarks ?? 40,
      duration: exam.duration ?? 180,
      room: exam.room || "",
      status: exam.status || "Scheduled",
      resultsPublished: Boolean(exam.resultsPublished),
      instructions: exam.instructions || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.className || !form.subject.trim() || !form.date) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      name: form.name.trim(),
      className: form.className,
      subject: form.subject.trim(),
      examType: form.examType,
      date: form.date,
      startTime: form.startTime,
      marks: Number(form.marks) || 100,
      passingMarks: Number(form.passingMarks) || 40,
      duration: Number(form.duration) || 180,
      room: form.room.trim(),
      status: form.status,
      resultsPublished: form.resultsPublished,
      instructions: form.instructions.trim(),
    };

    try {
      if (editingExam) {
        await updateExam({ id: editingExam.id, body: payload }).unwrap();
        toast.success("Exam updated successfully");
      } else {
        await createExam(payload).unwrap();
        toast.success("Exam scheduled successfully");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save exam");
    }
  };

  const handleQuickComplete = async (exam) => {
    const nextStatus = exam.status === "Completed" ? "Scheduled" : "Completed";
    try {
      await updateExam({
        id: exam.id,
        body: { status: nextStatus },
      }).unwrap();
      toast.success(`Exam marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update exam status");
    }
  };

  const handleTogglePublish = async (exam) => {
    const nextPublished = !exam.resultsPublished;
    try {
      await updateExam({
        id: exam.id,
        body: {
          resultsPublished: nextPublished,
          status: nextPublished ? "Completed" : exam.status,
        },
      }).unwrap();
      toast.success(
        nextPublished ? "Results marked as published" : "Results unpublished"
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update publish status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExam(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete exam");
    }
  };

  const isSaving = isCreating || isUpdating;

  const handleExportExcel = () => {
    downloadExcelFile({
      filename: `Exam_Schedule_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Exam Schedule",
      title: "Examination Schedule & Date Sheet",
      headers: [
        "Exam Name",
        "Class",
        "Subject",
        "Type",
        "Date",
        "Start Time",
        "Total Marks",
        "Passing Marks",
        "Duration (mins)",
        "Room",
        "Status",
        "Results Published",
      ],
      rows: filteredExams.map((ex) => [
        ex.name || "",
        `Class ${ex.className}`,
        ex.subject || "",
        ex.examType || ex.type || "",
        ex.date || "",
        ex.startTime || "09:00",
        ex.marks ?? ex.totalMarks ?? 100,
        ex.passingMarks ?? 40,
        ex.duration ?? 180,
        ex.room || "",
        ex.status || "Scheduled",
        ex.resultsPublished ? "Yes" : "No",
      ]),
    });
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Exam Management"
        description="Schedule, manage and publish exam results"
        eyebrow="Academics"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={filteredExams.length === 0}
              className="gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadExamsListPDF(filteredExams)}
              disabled={filteredExams.length === 0}
              className="gap-1.5"
            >
              <FileDown className="h-4 w-4 text-primary" /> PDF
            </Button>
            <Button variant="outline" asChild className="gap-1.5">
              <Link to="/result">
                Results Ledger <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              onClick={openCreateDialog}
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              <Plus className="h-4 w-4" /> Add Exam
            </Button>
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
            <CardTitle>Exam Schedule</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filteredExams.length} of {allExams.length} exams
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exam, subject, room..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classesList.map((c) => (
                  <SelectItem key={c.id || c.name} value={String(c.name)}>
                    Class {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EXAM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {EXAM_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
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
              <p>Failed to load exam schedule.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <p>No exams match your filters.</p>
              {(search || classFilter !== "all" || typeFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setClassFilter("all");
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
              {filteredExams.map((ex) => {
                const isCompleted = String(ex.status || "").toLowerCase() === "completed";
                const isCancelled = String(ex.status || "").toLowerCase() === "cancelled";

                return (
                  <div
                    key={ex.id}
                    className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/exam/${ex.id}`}
                          className="font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {ex.name}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="text-[11px] bg-primary/10 text-primary border-0"
                        >
                          {ex.examType || ex.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[11px] border-0 ${
                            isCompleted
                              ? "bg-success/10 text-success"
                              : isCancelled
                                ? "bg-destructive/10 text-destructive"
                                : "bg-info/10 text-info"
                          }`}
                        >
                          {ex.status || "Scheduled"}
                        </Badge>
                        {ex.resultsPublished && (
                          <Badge
                            variant="secondary"
                            className="text-[11px] bg-amber-500/10 text-amber-600 border-0 gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Results Published
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Class {ex.className}</span>
                        <span>·</span>
                        <span>{ex.subject}</span>
                        <span>·</span>
                        <span>
                          {ex.date}
                          {ex.startTime ? ` at ${ex.startTime}` : ""}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ex.marks ?? ex.totalMarks ?? 100} marks · {ex.duration ?? 180} mins
                        </span>
                        {ex.room && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {ex.room}
                            </span>
                          </>
                        )}
                        {typeof ex.enrolledStudents === "number" && (
                          <>
                            <span>·</span>
                            <span>{ex.enrolledStudents} enrolled</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleQuickComplete(ex)}
                      >
                        {isCompleted ? "Reopen" : "Mark Completed"}
                      </Button>
                      <Button
                        variant={ex.resultsPublished ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleTogglePublish(ex)}
                      >
                        {ex.resultsPublished ? "Unpublish" : "Publish Results"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View details">
                        <Link to={`/exam/${ex.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(ex)}
                        title="Edit exam"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ex)}
                        title="Delete exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit Exam" : "Add New Exam"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Exam Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Mid-Term Examination"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={form.className}
                  onValueChange={(val) => setForm((p) => ({ ...p, className: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList.map((c) => (
                      <SelectItem key={c.id || c.name} value={String(c.name)}>
                        Class {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={form.subject}
                  onValueChange={(val) => setForm((p) => ({ ...p, subject: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Subjects">All Subjects</SelectItem>
                    {subjectsList.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select
                  value={form.examType}
                  onValueChange={(val) => setForm((p) => ({ ...p, examType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm((p) => ({ ...p, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_STATUSES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.marks}
                  onChange={(e) => setForm((p) => ({ ...p, marks: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Passing Marks</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.passingMarks}
                  onChange={(e) => setForm((p) => ({ ...p, passingMarks: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  min={10}
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Room / Hall</Label>
                <Input
                  value={form.room}
                  onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                  placeholder="e.g. Exam Hall A"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Instructions</Label>
                <Textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
                  placeholder="Exam instructions (optional)"
                />
              </div>

              <div className="flex items-center justify-between sm:col-span-2 rounded-lg border border-border px-3 py-2">
                <div>
                  <Label className="text-sm">Results Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark whether results for this exam have been published
                  </p>
                </div>
                <Switch
                  checked={form.resultsPublished}
                  onCheckedChange={(checked) =>
                    setForm((p) => ({ ...p, resultsPublished: checked }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gradient-primary text-primary-foreground border-0"
              >
                {isSaving ? "Saving..." : editingExam ? "Update Exam" : "Save Exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This
              action cannot be undone.
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

export default ExamPage;
