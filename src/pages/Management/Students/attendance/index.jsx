import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetStudentAttendanceQuery } from "@/services/private/studentService";
import {
  CalendarCheck,
  Clock,
  Eye,
  GraduationCap,
  Layers,
  Loader2,
  ScanFace,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

function AttendancePage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: classesRes, isLoading: isClassesLoading } = useGetClassesDropdownQuery();
  const { data: todayAttendanceRes, isLoading: isAttLoading } = useGetStudentAttendanceQuery({
    date: today,
  });

  const classesList = useMemo(() => classesRes?.data || [], [classesRes]);
  const todayRecords = useMemo(() => todayAttendanceRes?.data || [], [todayAttendanceRes]);

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

    return {
      totalStudents,
      present,
      absent,
      leave,
    };
  }, [classesList, todayRecords]);

  const isLoading = isClassesLoading || isAttLoading;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow={`Daily Operations · ${today}`}
        title="Attendance"
        description="Class-wise attendance overview. Select a class to view its monthly register or mark today's roll call."
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

      {/* Global Today Summary Cards */}
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

      {/* Class-wise Attendance Cards */}
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
                          ? "bg-emerald-500/15 text-emerald-700"
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
                        <p className="font-bold text-emerald-700">{stats.present}</p>
                        <p className="text-[10px] text-emerald-700/80">Present</p>
                      </div>
                      <div className="rounded-lg bg-rose-500/10 py-1.5 px-1">
                        <p className="font-bold text-rose-700">{stats.absent}</p>
                        <p className="text-[10px] text-rose-700/80">Absent</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 py-1.5 px-1">
                        <p className="font-bold text-amber-700">{stats.leave}</p>
                        <p className="text-[10px] text-amber-700/80">Leave</p>
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
  );
}

export default AttendancePage;
