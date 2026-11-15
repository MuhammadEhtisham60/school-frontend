import { useState, useMemo } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileStack,
  BookOpen,
  Calendar,
  Download,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Award,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetPapersQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useDownloadPaperMutation,
} from "@/services/private/resourceService";

const CLASS_OPTIONS = [
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
];

const EXAM_TYPES = ["Unit Test", "Mid-Term", "Final", "Practical"];
const ACADEMIC_YEARS = ["2025-26", "2024-25", "2023-24", "2022-23"];

const EMPTY_FORM = {
  title: "",
  subject: "",
  className: "Class X",
  type: "Mid-Term",
  year: "2025-26",
  marks: "100",
  duration: "180",
  teacherName: "",
  description: "",
  file: null,
};

const typeBadgeClass = (type) => {
  switch (type) {
    case "Final":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    case "Mid-Term":
      return "bg-primary/10 text-primary border-primary/20";
    case "Practical":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    default:
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
};

function PaperCollectionPage() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [viewingPaper, setViewingPaper] = useState(null);
  const [formState, setFormState] = useState(EMPTY_FORM);

  const queryParams = useMemo(() => {
    const p = {};
    if (search.trim()) p.search = search.trim();
    if (filterClass !== "all") p.class = filterClass;
    if (filterType !== "all") p.type = filterType;
    if (filterYear !== "all") p.year = filterYear;
    return p;
  }, [search, filterClass, filterType, filterYear]);

  const { data: papersRes, isLoading, isFetching } = useGetPapersQuery(queryParams);
  const [createPaper, { isLoading: isCreating }] = useCreatePaperMutation();
  const [updatePaper, { isLoading: isUpdating }] = useUpdatePaperMutation();
  const [deletePaper] = useDeletePaperMutation();
  const [downloadPaper] = useDownloadPaperMutation();

  const papers = papersRes?.data || [];
  const serverStats = papersRes?.stats || {};

  const stats = [
    {
      label: "Total Papers",
      value: (serverStats.totalPapers ?? papers.length).toLocaleString(),
      icon: FileStack,
      color: "text-blue-500",
    },
    {
      label: "Subjects",
      value: (
        serverStats.subjects ?? new Set(papers.map((p) => p.subject)).size
      ).toLocaleString(),
      icon: BookOpen,
      color: "text-violet-500",
    },
    {
      label: "Academic Years",
      value: (
        serverStats.academicYears ?? new Set(papers.map((p) => p.year)).size
      ).toLocaleString(),
      icon: Calendar,
      color: "text-emerald-500",
    },
    {
      label: "Downloads",
      value: (
        serverStats.downloads ??
        papers.reduce((acc, p) => acc + (Number(p.downloads) || 0), 0)
      ).toLocaleString(),
      icon: Download,
      color: "text-amber-500",
    },
  ];

  const openAddDialog = () => {
    setEditingPaper(null);
    setFormState(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditDialog = (paper) => {
    setEditingPaper(paper);
    setFormState({
      title: paper.title || "",
      subject: paper.subject || "",
      className: paper.className || "Class X",
      type: paper.type || "Mid-Term",
      year: paper.year || "2025-26",
      marks: String(paper.marks ?? 100),
      duration: String(paper.duration ?? 180),
      teacherName: paper.teacherName || "",
      description: paper.description || "",
      file: null,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.subject.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    const fd = new FormData();
    if (formState.title.trim()) fd.append("title", formState.title.trim());
    fd.append("subject", formState.subject.trim());
    fd.append("className", formState.className);
    fd.append("type", formState.type);
    fd.append("year", formState.year);
    fd.append("marks", formState.marks || "100");
    fd.append("duration", formState.duration || "180");
    fd.append("teacherName", formState.teacherName.trim());
    fd.append("description", formState.description.trim());
    if (formState.file) {
      fd.append("file", formState.file);
    }

    try {
      if (editingPaper) {
        await updatePaper({ id: editingPaper.id, body: fd }).unwrap();
        toast.success("Question paper updated successfully");
      } else {
        await createPaper(fd).unwrap();
        toast.success("Question paper added successfully");
      }
      setFormOpen(false);
      setEditingPaper(null);
      setFormState(EMPTY_FORM);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save question paper");
    }
  };

  const handleDelete = async (paper) => {
    if (!window.confirm(`Delete "${paper.title || paper.subject}"?`)) return;
    try {
      await deletePaper(paper.id).unwrap();
      toast.success("Question paper deleted");
      if (viewingPaper?.id === paper.id) setViewingPaper(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete paper");
    }
  };

  const handleDownload = async (paper) => {
    try {
      const res = await downloadPaper(paper.id).unwrap();
      const updated = res?.data || paper;
      if (viewingPaper?.id === paper.id) {
        setViewingPaper(updated);
      }

      if (updated.fileUrl) {
        const a = document.createElement("a");
        a.href = updated.fileUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = updated.fileName || `${updated.subject}-${updated.year}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const content = [
          `QUESTION PAPER ARCHIVE`,
          `========================================`,
          `Title: ${updated.title || `${updated.subject} - ${updated.type}`}`,
          `Subject: ${updated.subject}`,
          `Class: ${updated.className}`,
          `Exam Type: ${updated.type}`,
          `Academic Year: ${updated.year}`,
          `Total Marks: ${updated.marks}`,
          `Duration: ${updated.duration} minutes`,
          updated.teacherName ? `Prepared By: ${updated.teacherName}` : null,
          ``,
          updated.description ? `Instructions / Notes:\n${updated.description}` : "",
        ]
          .filter((line) => line !== null)
          .join("\n");

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${updated.subject.replace(/\s+/g, "_")}_${updated.className.replace(/\s+/g, "_")}_${updated.year}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success("Download started");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to download paper");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Paper Collection"
        description="Archive of question papers across all subjects and years"
        eyebrow="Resources"
        actions={
          <Button
            onClick={openAddDialog}
            className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add Paper
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject, title, teacher..."
                className="pl-9"
              />
            </div>

            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASS_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exam Types</SelectItem>
                {EXAM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academic Years</SelectItem>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Papers List */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Question Papers
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {papers.length} {papers.length === 1 ? "paper" : "papers"} found
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileStack className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No question papers found</p>
              <p className="text-xs mt-1">
                Try adjusting your filters or add a new question paper.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {papers.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingPaper(p)}
                        className="font-semibold text-left hover:text-primary transition-colors truncate"
                      >
                        {p.title || `${p.subject} - ${p.type}`}
                      </button>
                      <Badge variant="outline" className={typeBadgeClass(p.type)}>
                        {p.type}
                      </Badge>
                      {p.fileUrl && (
                        <Badge variant="secondary" className="text-[11px] gap-1">
                          <FileText className="h-3 w-3" /> PDF/File
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{p.subject}</span>
                      <span>{p.className}</span>
                      <span>{p.year}</span>
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> {p.marks} Marks
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {p.duration} mins
                      </span>
                      {p.teacherName && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {p.teacherName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> {p.downloads ?? 0} downloads
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingPaper(p)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(p)}
                      className="gap-1.5"
                      title="Download Paper"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(p)}
                      title="Edit Paper"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p)}
                      title="Delete Paper"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPaper ? "Edit Question Paper" : "Add New Question Paper"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Paper Title (optional)</Label>
                <Input
                  value={formState.title}
                  onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Auto-generated if left blank"
                />
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={formState.subject}
                  onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  value={formState.className}
                  onValueChange={(val) => setFormState((s) => ({ ...s, className: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Exam Type *</Label>
                <Select
                  value={formState.type}
                  onValueChange={(val) => setFormState((s) => ({ ...s, type: val }))}
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
                <Label>Academic Year *</Label>
                <Select
                  value={formState.year}
                  onValueChange={(val) => setFormState((s) => ({ ...s, year: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  min="1"
                  value={formState.marks}
                  onChange={(e) => setFormState((s) => ({ ...s, marks: e.target.value }))}
                  placeholder="e.g. 100"
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  min="10"
                  value={formState.duration}
                  onChange={(e) => setFormState((s) => ({ ...s, duration: e.target.value }))}
                  placeholder="e.g. 180"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Prepared By (Teacher)</Label>
                <Input
                  value={formState.teacherName}
                  onChange={(e) => setFormState((s) => ({ ...s, teacherName: e.target.value }))}
                  placeholder="e.g. Prof. Tariq Mahmood"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Instructions / Notes</Label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Syllabus coverage, paper pattern, or exam instructions..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Upload Paper (PDF / DOC)</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, file: e.target.files?.[0] || null }))
                  }
                />
                {editingPaper?.fileName && !formState.file && (
                  <p className="text-xs text-muted-foreground">
                    Current file: {editingPaper.fileName}
                  </p>
                )}
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
                disabled={isSaving}
                className="gradient-primary text-primary-foreground border-0"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPaper ? "Update Paper" : "Save Paper"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewingPaper} onOpenChange={(o) => !o && setViewingPaper(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewingPaper && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <span>{viewingPaper.title || `${viewingPaper.subject} - ${viewingPaper.type}`}</span>
                  <Badge variant="outline" className={typeBadgeClass(viewingPaper.type)}>
                    {viewingPaper.type}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="font-medium">{viewingPaper.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="font-medium">{viewingPaper.className}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Academic Year</p>
                    <p className="font-medium">{viewingPaper.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Marks / Duration</p>
                    <p className="font-medium">
                      {viewingPaper.marks} Marks · {viewingPaper.duration} mins
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prepared By</p>
                    <p className="font-medium">{viewingPaper.teacherName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                    <p className="font-medium">{viewingPaper.downloads ?? 0}</p>
                  </div>
                </div>
                {viewingPaper.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Instructions / Notes</p>
                    <p className="text-foreground/90 whitespace-pre-line">
                      {viewingPaper.description}
                    </p>
                  </div>
                )}
                {viewingPaper.fileName && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Attached file: {viewingPaper.fileName}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingPaper(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => handleDownload(viewingPaper)}
                  className="gap-2 gradient-primary text-primary-foreground border-0"
                >
                  <Download className="h-4 w-4" /> Download Paper
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaperCollectionPage;
