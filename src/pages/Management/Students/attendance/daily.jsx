import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetClassByIdQuery,
  useGetClassesDropdownQuery,
} from "@/services/private/classService";
import {
  useGetStudentsQuery,
  useGetStudentAttendanceQuery,
  useSaveStudentAttendanceMutation,
} from "@/services/private/studentService";
import { downloadClassAttendancePDF } from "@/utils/pdfGenerator";
import { downloadExcelFile } from "@/utils/excelExport";
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  Clock,
  FileDown,
  FileSpreadsheet,
  Loader2,
  Save,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name) {
  if (!name) return "?";
  return String(name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClassDailyAttendancePage() {
  const { id: classIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const isClassScoped = Boolean(classIdParam);
  const initialDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    const qDate = searchParams.get("date");
    if (qDate) setSelectedDate(qDate);
  }, [searchParams]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [search, setSearch] = useState("");

  // Local editable attendance state: { [studentId]: { status: "Present"|"Absent"|"Leave", leaveReason: string } }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: classByIdRes, isLoading: isClassByIdLoading } = useGetClassByIdQuery(
    classIdParam,
    { skip: !isClassScoped }
  );
  const { data: classesDropdownRes } = useGetClassesDropdownQuery();
  const classesList = useMemo(() => classesDropdownRes?.data || [], [classesDropdownRes]);

  const scopedClassObj = classByIdRes?.data;

  // Sync selectedClass when opened from /classes/:id or default to first class on /attendance
  useEffect(() => {
    if (isClassScoped) {
      if (scopedClassObj?.name) {
        setSelectedClass(String(scopedClassObj.name));
      }
    } else if (!selectedClass && classesList.length > 0) {
      setSelectedClass(String(classesList[0].name));
    }
  }, [isClassScoped, scopedClassObj?.name, classesList, selectedClass]);

  const activeClassObj = useMemo(() => {
    if (isClassScoped && scopedClassObj) return scopedClassObj;
    return classesList.find((c) => String(c.name) === String(selectedClass));
  }, [isClassScoped, scopedClassObj, classesList, selectedClass]);

  const availableSections = useMemo(() => {
    if (Array.isArray(activeClassObj?.sections) && activeClassObj.sections.length > 0) {
      return activeClassObj.sections.map(String);
    }
    return ["A", "B", "C", "D"];
  }, [activeClassObj]);

  const { data: studentsRes, isLoading: isStudentsLoading } = useGetStudentsQuery(
    { class: selectedClass, limit: 500 },
    { skip: !selectedClass }
  );

  const { data: attendanceRes, isFetching: isAttendanceFetching } = useGetStudentAttendanceQuery(
    { class: selectedClass, date: selectedDate },
    { skip: !selectedClass || !selectedDate }
  );

  const [saveAttendance, { isLoading: isSaving }] = useSaveStudentAttendanceMutation();

  const classStudents = useMemo(() => {
    const list = studentsRes?.students || [];
    return list
      .filter((s) => s.is_active !== false)
      .filter((s) =>
        selectedSection === "all"
          ? true
          : String(s.section || "A").toLowerCase() === selectedSection.toLowerCase()
      )
      .sort((a, b) =>
        String(a.rollNo || "").localeCompare(String(b.rollNo || ""), undefined, {
          numeric: true,
        })
      );
  }, [studentsRes, selectedSection]);

  const savedRecordsByStudent = useMemo(() => {
    const map = {};
    (attendanceRes?.data || []).forEach((rec) => {
      map[String(rec.studentId)] = rec;
    });
    return map;
  }, [attendanceRes]);

  const hasExistingForDate = (attendanceRes?.data || []).length > 0;

  // Populate local attendanceMap whenever students or saved attendance for date/class changes
  useEffect(() => {
    const nextMap = {};
    classStudents.forEach((st) => {
      const sid = String(st.id);
      const existing = savedRecordsByStudent[sid];
      nextMap[sid] = {
        status: existing?.status || "Present",
        leaveReason: existing?.leaveReason || "",
      };
    });
    setAttendanceMap(nextMap);
    setHasUnsavedChanges(false);
  }, [classStudents, savedRecordsByStudent, selectedDate, selectedClass]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return classStudents;
    const q = search.trim().toLowerCase();
    return classStudents.filter((s) => {
      const name = String(s.fullName || s.name || "").toLowerCase();
      const roll = String(s.rollNo || "").toLowerCase();
      return name.includes(q) || roll.includes(q);
    });
  }, [classStudents, search]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    classStudents.forEach((st) => {
      const entry = attendanceMap[String(st.id)]?.status || "Present";
      if (entry === "Present") present += 1;
      else if (entry === "Absent") absent += 1;
      else if (entry === "Leave") leave += 1;
    });
    return {
      total: classStudents.length,
      present,
      absent,
      leave,
    };
  }, [classStudents, attendanceMap]);

  const handleSetStatus = (studentId, status) => {
    const sid = String(studentId);
    setAttendanceMap((prev) => ({
      ...prev,
      [sid]: {
        status,
        leaveReason: status === "Leave" ? prev[sid]?.leaveReason || "" : "",
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleLeaveReasonChange = (studentId, reason) => {
    const sid = String(studentId);
    setAttendanceMap((prev) => ({
      ...prev,
      [sid]: {
        status: prev[sid]?.status || "Leave",
        leaveReason: reason,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleMarkAll = (status) => {
    const next = {};
    classStudents.forEach((st) => {
      const sid = String(st.id);
      next[sid] = {
        status,
        leaveReason: status === "Leave" ? attendanceMap[sid]?.leaveReason || "" : "",
      };
    });
    setAttendanceMap(next);
    setHasUnsavedChanges(true);
    toast.info(`Marked all ${classStudents.length} students as ${status}`);
  };

  const handleSaveAttendance = async () => {
    if (classStudents.length === 0) {
      toast.error("No students to save attendance for");
      return;
    }

    const records = classStudents.map((st) => {
      const sid = String(st.id);
      const entry = attendanceMap[sid] || { status: "Present", leaveReason: "" };
      return {
        studentId: sid,
        class: st.class || selectedClass,
        section: st.section || "A",
        status: entry.status,
        leaveReason: entry.status === "Leave" ? entry.leaveReason.trim() : "",
      };
    });

    try {
      await saveAttendance({
        date: selectedDate,
        class: selectedClass,
        section: selectedSection === "all" ? undefined : selectedSection,
        records,
      }).unwrap();
      setHasUnsavedChanges(false);
      toast.success(
        `Attendance ${hasExistingForDate ? "updated" : "saved"} for Class ${selectedClass} (${selectedDate})`
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save attendance");
    }
  };

  const buildExportRows = () =>
    classStudents.map((st) => {
      const entry = attendanceMap[String(st.id)] || { status: "Present", leaveReason: "" };
      return {
        rollNo: st.rollNo || "—",
        fullName: st.fullName || st.name || "—",
        section: st.section || "A",
        status: entry.status,
        leaveReason: entry.status === "Leave" ? entry.leaveReason : "",
      };
    });

  const handleExportExcel = () => {
    const rows = buildExportRows();
    downloadExcelFile({
      filename: `Attendance_Class_${selectedClass}_${selectedDate}`,
      sheetName: `Class_${selectedClass}`,
      title: `Daily Attendance — Class ${selectedClass} (${selectedDate})`,
      headers: ["Roll No", "Student Name", "Section", "Status", "Leave Reason"],
      rows: rows.map((r) => [r.rollNo, r.fullName, r.section, r.status, r.leaveReason || "—"]),
    });
  };

  const handleExportPDF = () => {
    downloadClassAttendancePDF(selectedClass, selectedSection, selectedDate, buildExportRows());
  };

  const isLoading = (isClassScoped && isClassByIdLoading) || isStudentsLoading;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {isClassScoped && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to={`/classes/${classIdParam}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Class {selectedClass}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link to={`/attendance/class/${classIdParam}`}>
              View Monthly Attendance
            </Link>
          </Button>
        </div>
      )}

      <PageHeader
        eyebrow={isClassScoped ? `Class ${selectedClass} · Daily Register` : "Daily Operations"}
        title={selectedClass ? `Class ${selectedClass} Attendance` : "Student Attendance"}
        description="Mark Present (P), Absent (A), or Leave (L) for students and save against the selected date."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={classStudents.length === 0}
              className="gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={classStudents.length === 0}
              className="gap-1.5"
            >
              <FileDown className="h-4 w-4 text-primary" /> PDF
            </Button>
            <Button
              onClick={handleSaveAttendance}
              disabled={isSaving || classStudents.length === 0}
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {hasExistingForDate ? "Update Attendance" : "Save Attendance"}
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={isLoading ? "..." : summary.total}
          sub={`Class ${selectedClass || "—"}${selectedSection !== "all" ? `-${selectedSection}` : ""}`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          label="Present (P)"
          value={isLoading ? "..." : summary.present}
          sub={
            summary.total > 0
              ? `${Math.round((summary.present / summary.total) * 100)}% of class`
              : "No students"
          }
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          label="Absent (A)"
          value={isLoading ? "..." : summary.absent}
          sub="Marked absent"
          icon={UserX}
          variant="warning"
        />
        <StatCard
          label="Leave (L)"
          value={isLoading ? "..." : summary.leave}
          sub="On approved / requested leave"
          icon={Clock}
          variant="info"
        />
      </div>

      {/* Attendance Panel */}
      <Card className="shadow-card overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base sm:text-lg">
                Roll Call · {selectedDate}
              </CardTitle>
              {hasExistingForDate && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0">
                  Saved Record Loaded
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0">
                  Unsaved Changes
                </Badge>
              )}
              {isAttendanceFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Filters & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex items-center">
                <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-primary pointer-events-none" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-8 h-9 w-[155px] text-xs"
                />
              </div>

              {!isClassScoped && (
                <Select
                  value={selectedClass}
                  onValueChange={(val) => {
                    setSelectedClass(val);
                    setSelectedSection("all");
                  }}
                >
                  <SelectTrigger className="w-[140px] h-9 text-xs">
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
              )}

              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {availableSections.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or Roll #..."
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("Present")}
                disabled={classStudents.length === 0}
                className="h-9 text-xs gap-1.5 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark All Present
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <p>No active students found for this class/filter.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredStudents.map((st) => {
                const sid = String(st.id);
                const record = attendanceMap[sid] || { status: "Present", leaveReason: "" };
                const status = record.status;

                const cardBorderClass =
                  status === "Present"
                    ? "border-emerald-500/25 bg-emerald-500/[0.02]"
                    : status === "Absent"
                      ? "border-rose-500/30 bg-rose-500/[0.03]"
                      : "border-amber-500/35 bg-amber-500/[0.03]";

                const statusBadgeClass =
                  status === "Present"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : status === "Absent"
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400";

                return (
                  <div
                    key={sid}
                    className={`rounded-xl border p-3.5 transition-all hover:shadow-sm ${cardBorderClass}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                            {getInitials(st.fullName || st.name)}
                          </AvatarFallback>
                        </Avatar> */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {st.fullName || st.name}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] border-0 ${statusBadgeClass}`}
                            >
                              {status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono font-medium text-foreground/80">
                              Roll No: {st.rollNo || "N/A"}
                            </span>
                            {/* {" · "}
                            Section {st.section || "A"} */}
                          </p>
                        </div>
                      </div>

                      {/* P / A / L Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant={status === "Present" ? "default" : "outline"}
                          onClick={() => handleSetStatus(sid, "Present")}
                          className={
                            status === "Present"
                              ? "h-8 px-3 text-xs font-semibold rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                              : "h-8 px-3 text-xs font-medium rounded-sm border-emerald-500/35 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                          }
                        >
                          P
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={status === "Absent" ? "default" : "outline"}
                          onClick={() => handleSetStatus(sid, "Absent")}
                          className={
                            status === "Absent"
                              ? "h-8 px-3 text-xs font-semibold rounded-sm bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-sm"
                              : "h-8 px-3 text-xs font-medium rounded-sm border-rose-500/35 text-rose-700 hover:bg-rose-500/10 dark:text-rose-400"
                          }
                        >
                          A
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={status === "Leave" ? "default" : "outline"}
                          onClick={() => handleSetStatus(sid, "Leave")}
                          className={
                            status === "Leave"
                              ? "h-8 px-3 text-xs font-semibold rounded-sm bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm"
                              : "h-8 px-3 text-xs font-medium rounded-sm border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                          }
                        >
                          L
                        </Button>
                      </div>
                    </div>

                    {/* Optional Leave Reason Input */}
                    {status === "Leave" && (
                      <div className="mt-3 pt-2.5 border-t border-amber-500/20">
                        <Input
                          value={record.leaveReason}
                          onChange={(e) => handleLeaveReasonChange(sid, e.target.value)}
                          placeholder="Leave reason (optional)..."
                          className="h-8 text-xs bg-background/80"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Save Bar for convenience on long lists */}
          {filteredStudents.length > 6 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Showing {filteredStudents.length} students · Present: {summary.present} · Absent:{" "}
                {summary.absent} · Leave: {summary.leave}
              </p>
              <Button
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {hasExistingForDate ? "Update Attendance" : "Save Attendance"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClassDailyAttendancePage;
