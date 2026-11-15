import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetSubjectByIdQuery } from "@/services/private/subjectService";
import { useGetClassRoutinesQuery } from "@/services/private/classRoutineService";
import { useGetExamsQuery } from "@/services/private/examService";
import { downloadSubjectDetailPDF } from "@/utils/pdfGenerator";
import { downloadExcelFile } from "@/utils/excelExport";
import {
  ArrowLeft,
  BookOpenCheck,
  Clock,
  FileDown,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  User,
  Calendar,
} from "lucide-react";

function SubjectDetailsPage() {
  const { id } = useParams();
  const { data: subjectRes, isLoading, isError } = useGetSubjectByIdQuery(id);
  const { data: routinesRes } = useGetClassRoutinesQuery();
  const { data: examsRes } = useGetExamsQuery();

  const subject = subjectRes?.data;

  const relatedRoutines = useMemo(() => {
    if (!subject?.name) return [];
    const list = routinesRes?.data || routinesRes?.routines || [];
    return list.filter(
      (r) => String(r.subject || "").trim().toLowerCase() === subject.name.trim().toLowerCase()
    );
  }, [routinesRes, subject?.name]);

  const relatedExams = useMemo(() => {
    if (!subject?.name) return [];
    const list = examsRes?.data || examsRes?.exams || [];
    return list.filter((ex) => {
      const exSub = String(ex.subject || "").trim().toLowerCase();
      return exSub === subject.name.trim().toLowerCase() || exSub === "all subjects";
    });
  }, [examsRes, subject?.name]);

  const handleExportExcel = () => {
    if (!subject) return;
    downloadExcelFile({
      filename: `Subject_${subject.code || subject.name}_Schedule`,
      sheetName: subject.code || "Subject",
      title: `${subject.name} (${subject.code}) — Weekly Schedule`,
      headers: ["Day", "Start Time", "End Time", "Class", "Section", "Teacher", "Room"],
      rows: relatedRoutines.map((r) => [
        r.day,
        r.startTime,
        r.endTime,
        `Class ${r.className}`,
        r.section,
        r.teacher || r.teacherName || "Unassigned",
        r.room || "—",
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

  if (isError || !subject) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild className="gap-1.5">
          <Link to="/subjects">
            <ArrowLeft className="h-4 w-4" /> Back to Subjects
          </Link>
        </Button>
        <Card className="p-8 text-center text-muted-foreground">Subject not found.</Card>
      </div>
    );
  }

  const isActive = subject.isActive !== false;
  const classItems = Array.isArray(subject.classes) ? subject.classes : [];

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        eyebrow={`Academics · ${subject.department}`}
        title={`${subject.name} (${subject.code})`}
        description={subject.description || "Subject curriculum, faculty assignment and schedule"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild className="gap-1.5">
              <Link to="/subjects">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
            </Button>
            <Button
              onClick={() => downloadSubjectDetailPDF(subject, relatedRoutines, relatedExams)}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Type & Status</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              {subject.subjectType || "Core"}
            </Badge>
            <Badge
              variant="secondary"
              className={isActive ? "bg-success/10 text-success border-0" : "bg-muted"}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Load</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{subject.weeklyPeriods ?? 5} Periods</p>
            <p className="text-xs text-muted-foreground mt-1">
              {relatedRoutines.length} scheduled slots in timetable
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Teacher
            </CardTitle>
            <User className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {subject.teacherId ? (
              <Link
                to={`/teachers/details/${subject.teacherId}`}
                className="text-base font-semibold text-primary hover:underline"
              >
                {subject.teacher || subject.teacherName}
              </Link>
            ) : (
              <p className="text-base font-medium text-muted-foreground">
                {subject.teacher || subject.teacherName || "Unassigned"}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{subject.department} Department</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classes Covered
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {classItems.length > 0 ? (
                classItems.map((cls) => (
                  <Badge key={cls} variant="outline" className="text-xs">
                    Class {cls}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Not mapped</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Class Routine Slots ({relatedRoutines.length})</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/class-routine">Open Routine</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {relatedRoutines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No timetable periods assigned to this subject yet.
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {relatedRoutines.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium">
                        {r.day} · {r.startTime} - {r.endTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Class {r.className}-{r.section} {r.room ? `· ${r.room}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.teacher || r.teacherName || "Unassigned"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Related Exams ({relatedExams.length})</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/exam">Open Exams</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {relatedExams.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No exams scheduled for this subject yet.
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {relatedExams.map((ex) => (
                  <Link
                    key={ex.id}
                    to={`/exam/${ex.id}`}
                    className="flex items-center justify-between py-2.5 text-sm hover:bg-muted/30 rounded px-2 -mx-2 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {ex.date} · Class {ex.className} · {ex.marks ?? ex.totalMarks ?? 100} marks
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {ex.status || "Scheduled"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SubjectDetailsPage;
