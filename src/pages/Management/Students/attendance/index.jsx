import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetStudentAttendanceQuery } from "@/services/private/studentService";
import {
  useGetTeachersQuery,
  useGetTeacherAttendanceQuery,
  useSaveTeacherAttendanceMutation,
} from "@/services/private/teacherService";
import {
  Briefcase,
  CalendarCheck,
  CheckCheck,
  Clock,
  Eye,
  GraduationCap,
  Layers,
  Loader2,
  Save,
  ScanFace,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name = "") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AttendancePage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [activeTab, setActiveTab] = useState("students"); // "students" | "staff"

  // Students tab queries
  const { data: classesRes, isLoading: isClassesLoading } = useGetClassesDropdownQuery();
  const { data: todayAttendanceRes, isLoading: isAttLoading } = useGetStudentAttendanceQuery({
    date: today,
  });

  // Staff tab state & queries
  const [staffDate, setStaffDate] = useState(today);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffDraft, setStaffDraft] = useState({}); // { [teacherId]: { status, checkIn, checkOut, remarks } }

  const { data: teachersRes, isLoading: isTeachersLoading } = useGetTeachersQuery();
  const { data: teacherAttRes, isLoading: isTeacherAttLoading } = useGetTeacherAttendanceQuery({
    date: staffDate,
  });
  const [saveTeacherAttendance, { isLoading: isSavingStaff }] =
    useSaveTeacherAttendanceMutation();

  const classesList = useMemo(() => classesRes?.data || [], [classesRes]);
  const todayRecords = useMemo(() => todayAttendanceRes?.data || [], [todayAttendanceRes]);

  const teachersList = useMemo(
    () => teachersRes?.teachers || teachersRes?.data || [],
    [teachersRes]
  );
  const staffRecords = useMemo(() => teacherAttRes?.data || [], [teacherAttRes]);

  // Populate staffDraft whenever staffDate or loaded records/teachers change
  useEffect(() => {
    const recMap = new Map();
    staffRecords.forEach((r) => {
      const tid = String(r.teacherId || r.teacher || "");
      if (tid) recMap.set(tid, r);
    });

    const next = {};
    teachersList.forEach((t) => {
      const tid = String(t.id || t._id);
      const existing = recMap.get(tid);
      next[tid] = {
        status: existing?.status || "Present",
        checkIn: existing?.checkIn || "07:55 AM",
        checkOut: existing?.checkOut || "02:00 PM",
        remarks: existing?.remarks || "",
      };
    });
    setStaffDraft(next);
  }, [teachersList, staffRecords, staffDate]);

  // Student summary
  const byClassToday = useMemo(() => {
    const map = {};
    todayRecords.forEach((rec) => {
      const key = String(rec.class || "").trim().toLowerCase();
      if (!key) return;
      if (!map[key]) {
        map[key] = { total: 0, present: 0, absent: 0, leave: 0 };
      }
      map[key].total += 1;
      if (rec.status === "Present") map[key].present += 1;
      else if (rec.status === "Absent") map[key].absent += 1;
      else if (rec.status === "Leave") map[key].leave += 1;
    });
    return map;
  }, [todayRecords]);

  const globalSummary = useMemo(() => {
    const totalStudents = classesList.reduce((sum, c) => sum + Number(c.studentCount || 0), 0);
    let present = 0;
    let absent = 0;
    let leave = 0;

    todayRecords.forEach((r) => {
      if (r.status === "Present") present += 1;
      else if (r.status === "Absent") absent += 1;
      else if (r.status === "Leave") leave += 1;
    });

    return { totalStudents, present, absent, leave };
  }, [classesList, todayRecords]);

  // Staff summary
  const staffSummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    teachersList.forEach((t) => {
      const st = staffDraft[String(t.id || t._id)]?.status || "Present";
      if (st === "Present") present += 1;
      else if (st === "Absent") absent += 1;
      else if (st === "Leave") leave += 1;
    });
    return { total: teachersList.length, present, absent, leave };
  }, [teachersList, staffDraft]);

  const filteredTeachers = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return teachersList;
    return teachersList.filter((t) => {
      const hay = `${t.fullName || ""} ${t.employeeId || ""} ${t.subject || ""} ${t.department || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [teachersList, staffSearch]);

  const updateStaffRow = (tid, patch) => {
    setStaffDraft((prev) => ({
      ...prev,
      [tid]: {
        ...(prev[tid] || {
          status: "Present",
          checkIn: "07:55 AM",
          checkOut: "02:00 PM",
          remarks: "",
        }),
        ...patch,
      },
    }));
  };

  const handleMarkAllStaffPresent = () => {
    setStaffDraft((prev) => {
      const next = { ...prev };
      teachersList.forEach((t) => {
        const tid = String(t.id || t._id);
        next[tid] = {
          ...(next[tid] || { checkIn: "07:55 AM", checkOut: "02:00 PM", remarks: "" }),
          status: "Present",
        };
      });
      return next;
    });
    toast.info("All staff marked Present. Click Save Staff Attendance to persist.");
  };

  const handleSaveStaffAttendance = async () => {
    const records = teachersList.map((t) => {
      const tid = String(t.id || t._id);
      const row = staffDraft[tid] || {};
      return {
        teacherId: tid,
        status: row.status || "Present",
        checkIn: row.checkIn || "07:55 AM",
        checkOut: row.checkOut || "02:00 PM",
        remarks: row.status === "Leave" ? row.remarks || "" : row.remarks || "",
      };
    });

    try {
      await saveTeacherAttendance({ date: staffDate, records }).unwrap();
      toast.success(`Staff attendance saved for ${staffDate}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save staff attendance");
    }
  };

  const isLoading = isClassesLoading || isAttLoading;
  const isStaffLoading = isTeachersLoading || isTeacherAttLoading;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow={`Daily Operations · ${activeTab === "students" ? today : staffDate}`}
        title="Attendance"
        description="Manage student class-wise attendance and daily staff / faculty attendance in one place."
        actions={
          <Button
            asChild
            className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
          >
            <Link to="/attendance/face-scan">
              <ScanFace className="h-4 w-4" /> Face Scan Attendance
            </Link>
          </Button>
        }
      />

      {/* Mode Tabs: Students vs Staff */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "students" ? "default" : "outline"}
            onClick={() => setActiveTab("students")}
            className={
              activeTab === "students"
                ? "gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                : "gap-2"
            }
          >
            <GraduationCap className="h-4 w-4" />
            Students Attendance
            <Badge variant="secondary" className="ml-1 text-[11px]">
              {classesList.length} Classes
            </Badge>
          </Button>
          <Button
            variant={activeTab === "staff" ? "default" : "outline"}
            onClick={() => setActiveTab("staff")}
            className={
              activeTab === "staff"
                ? "gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                : "gap-2"
            }
          >
            <Briefcase className="h-4 w-4" />
            Staff Attendance
            <Badge variant="secondary" className="ml-1 text-[11px]">
              {teachersList.length} Staff
            </Badge>
          </Button>
        </div>
      </div>

      {/* TAB 1: STUDENTS ATTENDANCE */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Active Students"
              value={isLoading ? "..." : globalSummary.totalStudents.toLocaleString()}
              sub={`Across ${classesList.length} active classes`}
              icon={Users}
              variant="primary"
            />
            <StatCard
              label="Present Today"
              value={isLoading ? "..." : globalSummary.present.toLocaleString()}
              sub="Marked present today"
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              label="Absent Today"
              value={isLoading ? "..." : globalSummary.absent.toLocaleString()}
              sub="Marked absent today"
              icon={UserX}
              variant="warning"
            />
            <StatCard
              label="On Leave Today"
              value={isLoading ? "..." : globalSummary.leave.toLocaleString()}
              sub="Approved / requested leave"
              icon={Clock}
              variant="info"
            />
          </div>

          {isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : classesList.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              No active classes found.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {classesList.map((cls) => {
                const clsId = cls.id || cls._id;
                const key = String(cls.name || "").trim().toLowerCase();
                const stats = byClassToday[key];
                const isMarked = Boolean(stats && stats.total > 0);
                const rate =
                  isMarked && stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

                return (
                  <Card
                    key={clsId}
                    className="glass-card hover:shadow-lg transition-all border hover:border-primary/40 flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Layers className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold">Class {cls.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Sections:{" "}
                              {Array.isArray(cls.sections) && cls.sections.length
                                ? cls.sections.join(", ")
                                : "A"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] border-0 ${
                            isMarked
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isMarked ? `${rate}% Today` : "Not Marked"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground rounded-lg bg-muted/30 px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-primary" />
                          Enrolled Students
                        </span>
                        <span className="font-bold text-foreground text-sm">
                          {cls.studentCount ?? 0}
                        </span>
                      </div>

                      {isMarked ? (
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="rounded-lg bg-emerald-500/10 py-1.5 px-1">
                            <p className="font-bold text-emerald-700 dark:text-emerald-300">
                              {stats.present}
                            </p>
                            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
                              Present
                            </p>
                          </div>
                          <div className="rounded-lg bg-rose-500/10 py-1.5 px-1">
                            <p className="font-bold text-rose-700 dark:text-rose-300">
                              {stats.absent}
                            </p>
                            <p className="text-[10px] text-rose-700/80 dark:text-rose-300/80">
                              Absent
                            </p>
                          </div>
                          <div className="rounded-lg bg-amber-500/10 py-1.5 px-1">
                            <p className="font-bold text-amber-700 dark:text-amber-300">
                              {stats.leave}
                            </p>
                            <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                              Leave
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border/70 py-2.5 text-center text-xs text-muted-foreground">
                          Today&apos;s attendance not marked yet
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
                          <Link to={`/attendance/class/${clsId}`}>
                            <Eye className="h-3.5 w-3.5" /> View Class
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          asChild
                          className="h-8 text-xs gap-1 gradient-primary text-primary-foreground border-0"
                        >
                          <Link to={`/classes/${clsId}/attendance`}>
                            <CalendarCheck className="h-3.5 w-3.5" /> Mark Today
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STAFF ATTENDANCE */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Staff"
              value={isStaffLoading ? "..." : staffSummary.total}
              icon={Briefcase}
              variant="primary"
            />
            <StatCard
              label="Present"
              value={isStaffLoading ? "..." : staffSummary.present}
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              label="Absent"
              value={isStaffLoading ? "..." : staffSummary.absent}
              icon={UserX}
              variant="warning"
            />
            <StatCard
              label="On Leave"
              value={isStaffLoading ? "..." : staffSummary.leave}
              icon={Clock}
              variant="info"
            />
          </div>

          {/* Controls Bar */}
          <Card className="p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder="Search staff by name, ID or subject..."
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Date:</span>
                  <Input
                    type="date"
                    value={staffDate}
                    onChange={(e) => setStaffDate(e.target.value || today)}
                    className="h-9 w-40"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllStaffPresent}
                  className="gap-1.5"
                >
                  <CheckCheck className="h-4 w-4" /> Mark All Present
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSavingStaff || isStaffLoading}
                  onClick={handleSaveStaffAttendance}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-glow"
                >
                  {isSavingStaff ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Staff Attendance
                </Button>
              </div>
            </div>
          </Card>

          {/* Staff Attendance List */}
          {isStaffLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              No staff members found.
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTeachers.map((t) => {
                const tid = String(t.id || t._id);
                const row = staffDraft[tid] || {
                  status: "Present",
                  checkIn: "07:55 AM",
                  checkOut: "02:00 PM",
                  remarks: "",
                };

                return (
                  <Card
                    key={tid}
                    className="p-4 shadow-card transition-all border hover:border-primary/30"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Staff Identity */}
                      <div className="flex items-center gap-3 min-w-[230px]">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={t.photo} />
                          <AvatarFallback className="gradient-primary text-primary-foreground font-semibold text-sm">
                            {getInitials(t.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/teachers/${tid}`}
                              className="font-semibold text-sm hover:text-primary truncate"
                            >
                              {t.fullName}
                            </Link>
                            <Badge variant="outline" className="text-[10px]">
                              {t.employeeId || `TCH-${tid}`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.subject || "Faculty"} • {t.department || "Academics"}
                          </p>
                        </div>
                      </div>

                      {/* P / A / L Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          {
                            key: "Present",
                            short: "P",
                            activeCls:
                              "bg-emerald-600 text-white border-emerald-600 shadow-sm",
                            idleCls:
                              "hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/40",
                          },
                          {
                            key: "Absent",
                            short: "A",
                            activeCls: "bg-rose-600 text-white border-rose-600 shadow-sm",
                            idleCls:
                              "hover:bg-rose-500/10 hover:text-rose-700 hover:border-rose-500/40",
                          },
                          {
                            key: "Leave",
                            short: "L",
                            activeCls: "bg-amber-500 text-white border-amber-500 shadow-sm",
                            idleCls:
                              "hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/40",
                          },
                        ].map((opt) => {
                          const isSelected = row.status === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => updateStaffRow(tid, { status: opt.key })}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? opt.activeCls
                                  : `bg-background border-border text-muted-foreground ${opt.idleCls}`
                              }`}
                            >
                              {opt.key} ({opt.short})
                            </button>
                          );
                        })}
                      </div>

                      {/* Check-in / Check-out / Remarks */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:w-[380px]">
                        <Input
                          value={row.checkIn}
                          onChange={(e) => updateStaffRow(tid, { checkIn: e.target.value })}
                          placeholder="Check In"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={row.checkOut}
                          onChange={(e) => updateStaffRow(tid, { checkOut: e.target.value })}
                          placeholder="Check Out"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={row.remarks}
                          onChange={(e) => updateStaffRow(tid, { remarks: e.target.value })}
                          placeholder={
                            row.status === "Leave" ? "Leave reason (optional)" : "Remarks (optional)"
                          }
                          className="h-8 text-xs col-span-2 sm:col-span-1"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
