import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetExamsQuery, useUpdateExamMutation } from "@/services/private/examService";
import { useGetStudentsQuery } from "@/services/private/studentService";
import { downloadExamDetailPDF } from "@/utils/pdfGenerator";
import { downloadExcelFile } from "@/utils/excelExport";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileDown,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";

function ExamDetailsPage() {
  const { id } = useParams();
  const { data: examsRes, isLoading, isError } = useGetExamsQuery();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();

  const exam = useMemo(() => {
    const list = examsRes?.data || examsRes?.exams || [];
    return list.find((ex) => String(ex.id) === String(id)) || null;
  }, [examsRes, id]);

  const { data: studentsRes, isLoading: isStudentsLoading } = useGetStudentsQuery(
    { class: exam?.className, limit: 500 },
    { skip: !exam?.className }
  );

  const enrolledStudents = useMemo(() => {
    const list = studentsRes?.students || [];
    if (!exam?.className) return [];
    return list.filter(
      (s) =>
        String(s.class || "").trim().toLowerCase() ===
          String(exam.className).trim().toLowerCase() && s.is_active !== false
    );
  }, [studentsRes, exam?.className]);

  const handleToggleComplete = async () => {
    if (!exam) return;
    const nextStatus = exam.status === "Completed" ? "Scheduled" : "Completed";
    try {
      await updateExam({ id: exam.id, body: { status: nextStatus } }).unwrap();
      toast.success(`Exam marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleTogglePublish = async () => {
    if (!exam) return;
    const nextPublished = !exam.resultsPublished;
    try {
      await updateExam({
        id: exam.id,
        body: {
          resultsPublished: nextPublished,
          status: nextPublished ? "Completed" : exam.status,
        },
      }).unwrap();
      toast.success(nextPublished ? "Results marked as published" : "Results unpublished");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update publish status");
    }
  };

  const handleExportExcel = () => {
    if (!exam) return;
    downloadExcelFile({
      filename: `Exam_${exam.name}_Candidates`,
      sheetName: `Class_${exam.className}`,
      title: `${exam.name} — Class ${exam.className} (${exam.date})`,
      headers: ["Roll No", "Student Name", "Father Name", "Class", "Section", "Total Marks", "Passing Marks"],
      rows: enrolledStudents.map((st, idx) => [
        st.rollNo || idx + 1,
        st.fullName || st.name || "—",
        st.fatherName || "—",
        `Class ${st.class || exam.className}`,
        st.section || "A",
        exam.marks ?? exam.totalMarks ?? 100,
        exam.passingMarks ?? 40,
      ]),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild className="gap-1.5">
          <Link to="/exam">
            <ArrowLeft className="h-4 w-4" /> Back to Exams
          </Link>
        </Button>
        <Card className="p-8 text-center text-muted-foreground">Exam not found.</Card>
      </div>
    );
  }

  const isCompleted = String(exam.status || "").toLowerCase() === "completed";

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        eyebrow={`Academics · ${exam.examType || exam.type}`}
        title={exam.name}
        description={`Class ${exam.className} · ${exam.subject} · Scheduled for ${exam.date}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild className="gap-1.5">
              <Link to="/exam">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
            </Button>
            <Button
              onClick={() => downloadExamDetailPDF(exam, enrolledStudents)}
              className="gap-1.5 gradient-primary text-primary-foreground border-0"
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Date & Time</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{exam.date}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {exam.startTime || "09:00"} · {exam.duration ?? 180} mins
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marks Scheme</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{exam.marks ?? exam.totalMarks ?? 100} Total</p>
            <p className="text-xs text-muted-foreground mt-1">
              Passing Marks: {exam.passingMarks ?? 40}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Venue & Room</CardTitle>
            <MapPin className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{exam.room || "Main Hall"}</p>
            <p className="text-xs text-muted-foreground mt-1">Class {exam.className}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Candidates</CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {isStudentsLoading ? "..." : enrolledStudents.length} Students
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className="text-[10px]">
                {exam.status || "Scheduled"}
              </Badge>
              {exam.resultsPublished && (
                <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">
                  Published
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Exam Controls & Instructions</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {exam.instructions || "Standard examination guidelines apply."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={handleToggleComplete}
              className="gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              {isCompleted ? "Reopen Exam" : "Mark Completed"}
            </Button>
            <Button
              variant={exam.resultsPublished ? "secondary" : "outline"}
              size="sm"
              disabled={isUpdating}
              onClick={handleTogglePublish}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {exam.resultsPublished ? "Unpublish Results" : "Publish Results"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/result">Open Results Ledger</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            Enrolled Candidates — Class {exam.className} ({enrolledStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isStudentsLoading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : enrolledStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No active students found in Class {exam.className}.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {enrolledStudents.map((st) => (
                <Link
                  key={st.id}
                  to={`/students/details/${st.id}`}
                  className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded hover:bg-muted/30 transition-colors text-sm"
                >
                  <div>
                    <p className="font-medium">{st.fullName || st.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Roll No: {st.rollNo || "—"} · Section {st.section || "A"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {st.feeStatus || "Active"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ExamDetailsPage;
