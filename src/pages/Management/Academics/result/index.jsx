import { useState, useMemo } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Award,
  TrendingUp,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Star,
  Trophy,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { StatCard } from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API endpoints
import {
  useGetResultsQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useDeleteTermResultMutation,
} from "@/services/private/resultService";
import { useGetStudentsQuery } from "@/services/private/studentService";

const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];
const TERMS = ["First Term", "Mid Term", "Final Term"];

function ResultPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");

  // Dialog / Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    studentId: "",
    academicYear: "2026-2027",
    termName: "First Term",
    rollNo: "",
    promotionStatus: "Pending",
    remarks: "",
    subjects: [{ subjectName: "", totalMarks: 100, obtainedMarks: "", remarks: "" }],
  });

  const [editForm, setEditForm] = useState({
    rollNo: "",
    promotionStatus: "Pending",
    remarks: "",
    subjects: [{ subjectName: "", totalMarks: 100, obtainedMarks: "", remarks: "" }],
  });

  // Queries
  const {
    data: resultsResponse,
    isLoading: isResultsLoading,
    error: resultsError,
  } = useGetResultsQuery({
    class: classFilter !== "all" ? classFilter : undefined,
    section: sectionFilter !== "all" ? sectionFilter : undefined,
    academicYear: academicYearFilter !== "all" ? academicYearFilter : undefined,
  });
  const resultsList = resultsResponse?.data || [];

  const { data: studentsResponse } = useGetStudentsQuery({ limit: 1000 });
  const studentsList = studentsResponse?.students || [];

  // Mutations
  const [createResult, { isLoading: isCreating }] = useCreateResultMutation();
  const [updateResult, { isLoading: isUpdating }] = useUpdateResultMutation();
  const [deleteResult, { isLoading: isDeleting }] = useDeleteResultMutation();
  const [deleteTermResult, { isLoading: isDeletingTerm }] = useDeleteTermResultMutation();

  // Selected student details helper
  const selectedStudent = useMemo(() => {
    return studentsList.find((s) => s.id === addForm.studentId);
  }, [addForm.studentId, studentsList]);

  // Dynamic Metrics Computation
  const metrics = useMemo(() => {
    let totalTerms = 0;
    let passTerms = 0;
    let totalPctSum = 0;
    let pctCount = 0;
    let distinctionCount = 0;
    let topObtained = 0;
    let topStudent = "—";

    const subjectSums = {};
    const subjectCounts = {};
    const subjectTops = {};

    const toppersList = [];
    const flattened = [];

    resultsList.forEach((record) => {
      Object.entries(record.terms || {}).forEach(([termName, termDetails]) => {
        // Stats
        totalTerms++;
        if (termDetails.resultStatus?.toLowerCase() === "pass") {
          passTerms++;
        }
        if (termDetails.percentage !== undefined && termDetails.percentage !== null) {
          const pct = termDetails.percentage;
          totalPctSum += pct;
          pctCount++;
          if (pct >= 90) {
            distinctionCount++;
          }
          if (pct > topObtained) {
            topObtained = pct;
            topStudent = record.studentId?.name || "Jane Doe";
          }

          toppersList.push({
            id: `${record.id}-${termName}`,
            student: record.studentId?.name || "Unknown",
            class: `${record.class}-${record.section}`,
            exam: termName,
            score: `${Math.round(pct)}%`,
            status: termDetails.grade || "N/A",
            rank: termDetails.position || 1,
            percentage: pct,
          });
        }

        // Subjects Chart calculation
        (termDetails.subjects || []).forEach((subj) => {
          const name = subj.subjectName;
          const pct = subj.totalMarks > 0 ? (subj.obtainedMarks / subj.totalMarks) * 100 : 0;
          if (!subjectSums[name]) {
            subjectSums[name] = 0;
            subjectCounts[name] = 0;
            subjectTops[name] = 0;
          }
          subjectSums[name] += pct;
          subjectCounts[name]++;
          if (pct > subjectTops[name]) {
            subjectTops[name] = pct;
          }
        });

        // Flatten for general table display
        flattened.push({
          id: record.id,
          termName,
          studentName: record.studentId?.name || "—",
          studentId: record.studentId?.id,
          class: record.class,
          section: record.section,
          rollNo: record.rollNo,
          academicYear: record.academicYear,
          score: termDetails.percentage ? `${Math.round(termDetails.percentage)}%` : "—",
          grade: termDetails.grade || "—",
          status: termDetails.resultStatus || "—",
          gpa: termDetails.gpa || 0,
          subjects: termDetails.subjects || [],
          remarks: termDetails.remarks || "",
          record,
        });
      });
    });

    const passRate = totalTerms > 0 ? `${Math.round((passTerms / totalTerms) * 100)}%` : "0%";
    const avgScore = pctCount > 0 ? `${Math.round(totalPctSum / pctCount)}%` : "0%";
    const distinctionsVal = `${distinctionCount} Students`;

    const chartData = Object.keys(subjectSums).map((name) => ({
      subject: name.slice(0, 8),
      average: Math.round(subjectSums[name] / subjectCounts[name]),
      top: Math.round(subjectTops[name]),
    }));

    return {
      passRate,
      avgScore,
      distinctionsVal,
      topStudent,
      chartData: chartData.length > 0 ? chartData : [
        { subject: "Math", average: 75, top: 95 },
        { subject: "Science", average: 80, top: 98 },
        { subject: "English", average: 70, top: 92 },
      ],
      toppers: toppersList.sort((a, b) => b.percentage - a.percentage).slice(0, 5),
      flattenedResults: flattened,
    };
  }, [resultsList]);

  // Local filtering for flattened term results
  const filteredResults = useMemo(() => {
    return metrics.flattenedResults.filter((r) => {
      const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase());
      const matchesTerm = termFilter === "all" || r.termName === termFilter;
      return matchesSearch && matchesTerm;
    });
  }, [metrics.flattenedResults, search, termFilter]);

  // Form subject managers
  const handleSubjectChange = (formType, index, field, val) => {
    if (formType === "add") {
      const newSubjects = [...addForm.subjects];
      newSubjects[index] = { ...newSubjects[index], [field]: val };
      setAddForm({ ...addForm, subjects: newSubjects });
    } else {
      const newSubjects = [...editForm.subjects];
      newSubjects[index] = { ...newSubjects[index], [field]: val };
      setEditForm({ ...editForm, subjects: newSubjects });
    }
  };

  const handleAddSubjectField = (formType) => {
    if (formType === "add") {
      setAddForm({
        ...addForm,
        subjects: [...addForm.subjects, { subjectName: "", totalMarks: 100, obtainedMarks: "", remarks: "" }],
      });
    } else {
      setEditForm({
        ...editForm,
        subjects: [...editForm.subjects, { subjectName: "", totalMarks: 100, obtainedMarks: "", remarks: "" }],
      });
    }
  };

  const handleRemoveSubjectField = (formType, index) => {
    if (formType === "add") {
      setAddForm({
        ...addForm,
        subjects: addForm.subjects.filter((_, idx) => idx !== index),
      });
    } else {
      setEditForm({
        ...editForm,
        subjects: editForm.subjects.filter((_, idx) => idx !== index),
      });
    }
  };

  // Mutator Actions
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!addForm.studentId) {
      toast.error("Please select a student");
      return;
    }
    if (addForm.subjects.some((s) => !s.subjectName || s.obtainedMarks === "")) {
      toast.error("All subjects must have a name and obtained marks");
      return;
    }

    const payload = {
      studentId: addForm.studentId,
      class: selectedStudent.class,
      section: selectedStudent.section,
      academicYear: addForm.academicYear,
      rollNo: addForm.rollNo || selectedStudent.rollNo || "",
      promotionStatus: addForm.promotionStatus,
      terms: {
        [addForm.termName]: {
          remarks: addForm.remarks,
          subjects: addForm.subjects.map((s) => ({
            subjectName: s.subjectName,
            totalMarks: Number(s.totalMarks),
            obtainedMarks: Number(s.obtainedMarks),
            remarks: s.remarks || "",
          })),
        },
      },
    };

    try {
      await createResult(payload).unwrap();
      toast.success("Result record created successfully!");
      setIsAddOpen(false);
      setAddForm({
        studentId: "",
        academicYear: "2026-2027",
        termName: "First Term",
        rollNo: "",
        promotionStatus: "Pending",
        remarks: "",
        subjects: [{ subjectName: "", totalMarks: 100, obtainedMarks: "", remarks: "" }],
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create result record");
    }
  };

  const handleOpenEdit = (res) => {
    setSelectedResult(res);
    setEditForm({
      rollNo: res.rollNo || "",
      promotionStatus: res.record?.promotionStatus || "Pending",
      remarks: res.remarks || "",
      subjects: res.subjects.map((s) => ({
        subjectName: s.subjectName,
        totalMarks: s.totalMarks ?? 100,
        obtainedMarks: s.obtainedMarks ?? "",
        remarks: s.remarks || "",
      })),
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editForm.subjects.some((s) => !s.subjectName || s.obtainedMarks === "")) {
      toast.error("All subjects must have a name and obtained marks");
      return;
    }

    const payload = {
      rollNo: editForm.rollNo,
      promotionStatus: editForm.promotionStatus,
      terms: {
        [selectedResult.termName]: {
          remarks: editForm.remarks,
          subjects: editForm.subjects.map((s) => ({
            subjectName: s.subjectName,
            totalMarks: Number(s.totalMarks),
            obtainedMarks: Number(s.obtainedMarks),
            remarks: s.remarks || "",
          })),
        },
      },
    };

    try {
      await updateResult({
        id: selectedResult.id,
        body: payload,
        studentId: selectedResult.studentId,
      }).unwrap();
      toast.success("Result record updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update result record");
    }
  };

  const handleDeleteTerm = async (resId, termName, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${termName} results for ${studentName}?`)) {
      return;
    }
    try {
      await deleteTermResult({ id: resId, termName }).unwrap();
      toast.success(`${termName} result deleted successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || `Failed to delete ${termName} result`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Academics"
        title="Result Management"
        description="Track student performance, publish marks and analyze academic trends."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Pass Rate"
          value={metrics.passRate}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Average Score"
          value={metrics.avgScore}
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          label="Distinctions"
          value={metrics.distinctionsVal}
          icon={Award}
          variant="warning"
        />
        <StatCard
          label="Top Performer"
          value={metrics.topStudent}
          icon={Trophy}
          variant="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 glass-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>Average vs Top scores across departments (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="subject"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="average" fill="oklch(0.55 0.22 280)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="top" fill="oklch(0.7 0.18 320)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_280)]" />
                <span>Average Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.7_0.18_320)]" />
                <span>Top Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toppers Card */}
        <Card className="glass-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Class Toppers
            </CardTitle>
            <CardDescription>Top performers from recent terms</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {metrics.toppers.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No topper records available yet.
                </div>
              ) : (
                metrics.toppers.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                        {r.student.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.student}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.class} · {r.exam}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 font-bold">
                      {r.score} ({r.status})
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table Section */}
      <Card className="glass-card border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Result Publications</CardTitle>
              <CardDescription>Browse and manage student term results</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  className="pl-9 w-[200px] sm:w-[260px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Filters and List Toolbar */}
        <ListToolbar
          search={search}
          setSearch={setSearch}
          onAdd={() => setIsAddOpen(true)}
          addLabel="Add Result Record"
          hideSearch // Custom layout overrides the base search bar here
        >
          <div className="flex flex-wrap gap-2">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[120px]">
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
              <SelectTrigger className="w-[120px]">
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

            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERMS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ListToolbar>

        <CardContent className="p-0">
          {isResultsLoading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading result history...</p>
              </div>
            </div>
          ) : resultsError ? (
            <div className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 animate-pulse" />
              <div>
                <p className="font-semibold">Failed to load academic records</p>
                <p className="text-sm opacity-90">
                  {resultsError?.data?.message || "Verify your connection or server status."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student Name</th>
                    <th className="px-6 py-4 font-semibold">Class / Section</th>
                    <th className="px-6 py-4 font-semibold">Roll No</th>
                    <th className="px-6 py-4 font-semibold">Academic Year</th>
                    <th className="px-6 py-4 font-semibold">Examination</th>
                    <th className="px-6 py-4 font-semibold text-center">Score</th>
                    <th className="px-6 py-4 font-semibold text-center">Grade / GPA</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredResults.map((res, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-foreground">{res.studentName}</td>
                      <td className="px-6 py-4">Class {res.class}-{res.section}</td>
                      <td className="px-6 py-4 font-mono">#{res.rollNo || "N/A"}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{res.academicYear}</td>
                      <td className="px-6 py-4 font-semibold text-primary">{res.termName}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{res.score}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded font-mono text-xs bg-muted font-bold mr-1">
                          {res.grade}
                        </span>
                        <span className="text-xs text-muted-foreground">({res.gpa} GPA)</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(res)}
                            title="Edit result details"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteTerm(res.id, res.termName, res.studentName)}
                            title="Delete term results"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                        No term results match your selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Add Result Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create New Term Result
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="global-student">Select Student</Label>
              <select
                id="global-student"
                value={addForm.studentId}
                onChange={(e) => {
                  const studentId = e.target.value;
                  const found = studentsList.find((s) => s.id === studentId);
                  setAddForm({
                    ...addForm,
                    studentId,
                    rollNo: found?.rollNo || "",
                  });
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>Select Student...</option>
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName || s.name} (Class {s.class}-{s.section})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                <p><strong>Class Profile:</strong> Class {selectedStudent.class}-{selectedStudent.section}</p>
                <p><strong>Roll No:</strong> #{selectedStudent.rollNo || "N/A"}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="global-academic-year">Academic Year</Label>
                <Input
                  id="global-academic-year"
                  value={addForm.academicYear}
                  onChange={(e) => setAddForm({ ...addForm, academicYear: e.target.value })}
                  placeholder="e.g. 2026-2027"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="global-term">Term Name</Label>
                <select
                  id="global-term"
                  value={addForm.termName}
                  onChange={(e) => setAddForm({ ...addForm, termName: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="global-rollno">Roll No (Override)</Label>
                <Input
                  id="global-rollno"
                  value={addForm.rollNo}
                  onChange={(e) => setAddForm({ ...addForm, rollNo: e.target.value })}
                  placeholder="e.g. 12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="global-promotion">Promotion Status</Label>
                <select
                  id="global-promotion"
                  value={addForm.promotionStatus}
                  onChange={(e) => setAddForm({ ...addForm, promotionStatus: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Promoted">Promoted</option>
                  <option value="Demoted">Demoted</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-remarks">Overall Remarks</Label>
              <Textarea
                id="global-remarks"
                value={addForm.remarks}
                onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                placeholder="Overall term performance"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subjects & Marks</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSubjectField("add")}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Subject
                </Button>
              </div>
              <div className="space-y-3">
                {addForm.subjects.map((subj, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 border p-3 rounded-lg bg-muted/20 relative group">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Subject Name</Label>
                      <Input
                        value={subj.subjectName}
                        onChange={(e) => handleSubjectChange("add", index, "subjectName", e.target.value)}
                        placeholder="Mathematics"
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Total Marks</Label>
                      <Input
                        type="number"
                        value={subj.totalMarks}
                        onChange={(e) => handleSubjectChange("add", index, "totalMarks", e.target.value)}
                        required
                        className="h-8 text-xs"
                        min="1"
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Obtained Marks</Label>
                      <Input
                        type="number"
                        value={subj.obtainedMarks}
                        onChange={(e) => handleSubjectChange("add", index, "obtainedMarks", e.target.value)}
                        required
                        className="h-8 text-xs"
                        min="0"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Grade / Remarks (Optional)</Label>
                      <Input
                        value={subj.remarks}
                        onChange={(e) => handleSubjectChange("add", index, "remarks", e.target.value)}
                        placeholder="A+"
                        className="h-8 text-xs"
                      />
                    </div>
                    {addForm.subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSubjectField("add", index)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0 font-semibold"
                disabled={isCreating}
              >
                {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Result
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Global Edit Result Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Term Results
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <p><strong>Student:</strong> {selectedResult?.studentName}</p>
              <p><strong>Term:</strong> {selectedResult?.termName} ({selectedResult?.academicYear})</p>
              <p><strong>Class Profile:</strong> Class {selectedResult?.class}-{selectedResult?.section}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rollno">Roll No (for result record)</Label>
                <Input
                  id="edit-rollno"
                  value={editForm.rollNo}
                  onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                  placeholder="e.g. 12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-promotion">Promotion Status</Label>
                <select
                  id="edit-promotion"
                  value={editForm.promotionStatus}
                  onChange={(e) => setEditForm({ ...editForm, promotionStatus: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Promoted">Promoted</option>
                  <option value="Demoted">Demoted</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-remarks">Overall Remarks</Label>
              <Textarea
                id="edit-remarks"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="Overall performance evaluation"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subjects & Marks</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSubjectField("edit")}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Subject
                </Button>
              </div>
              <div className="space-y-3">
                {editForm.subjects.map((subj, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 border p-3 rounded-lg bg-muted/20 relative group">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Subject Name</Label>
                      <Input
                        value={subj.subjectName}
                        onChange={(e) => handleSubjectChange("edit", index, "subjectName", e.target.value)}
                        placeholder="Mathematics"
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Total Marks</Label>
                      <Input
                        type="number"
                        value={subj.totalMarks}
                        onChange={(e) => handleSubjectChange("edit", index, "totalMarks", e.target.value)}
                        required
                        className="h-8 text-xs"
                        min="1"
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Obtained Marks</Label>
                      <Input
                        type="number"
                        value={subj.obtainedMarks}
                        onChange={(e) => handleSubjectChange("edit", index, "obtainedMarks", e.target.value)}
                        required
                        className="h-8 text-xs"
                        min="0"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Grade / Remarks (Optional)</Label>
                      <Input
                        value={subj.remarks}
                        onChange={(e) => handleSubjectChange("edit", index, "remarks", e.target.value)}
                        placeholder="A+"
                        className="h-8 text-xs"
                      />
                    </div>
                    {editForm.subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSubjectField("edit", index)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0 font-semibold"
                disabled={isUpdating}
              >
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ResultPage;
