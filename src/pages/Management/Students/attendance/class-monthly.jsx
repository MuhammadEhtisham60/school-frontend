import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetClassByIdQuery } from "@/services/private/classService";
import { useGetStudentAttendanceQuery } from "@/services/private/studentService";
import { downloadExcelFile } from "@/utils/excelExport";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Clock,
  Eye,
  FileSpreadsheet,
  Loader2,
  Plus,
  UserCheck,
  UserX,
} from "lucide-react";

function ClassMonthlyAttendancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  const { data: classRes, isLoading: isClassLoading } = useGetClassByIdQuery(id);
  const classData = classRes?.data;
  const className = classData?.name || "";

  const { data: attendanceRes, isLoading: isAttendanceLoading } = useGetStudentAttendanceQuery(
    { class: className, month: selectedMonth },
    { skip: !className || !selectedMonth }
  );

  const dailyRows = useMemo(() => {
    const records = attendanceRes?.data || [];
    const byDate = {};

    records.forEach((rec) => {
      const d = rec.date;
      if (!d) return;
      if (!byDate[d]) {
        byDate[d] = {
          date: d,
          total: 0,
          present: 0,
          absent: 0,
          leave: 0,
        };
      }
      byDate[d].total += 1;
      if (rec.status === "Present") byDate[d].present += 1;
      else if (rec.status === "Absent") byDate[d].absent += 1;
      else if (rec.status === "Leave") byDate[d].leave += 1;
    });

    return Object.values(byDate)
      .map((row) => ({
        ...row,
        rate: row.total > 0 ? Math.round((row.present / row.total) * 100) : 0,
        dayName: new Date(`${row.date}T00:00:00`).toLocaleDateString("en-US", {
          weekday: "long",
        }),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRes]);

  const monthSummary = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalMarked = 0;

    dailyRows.forEach((r) => {
      totalPresent += r.present;
      totalAbsent += r.absent;
      totalLeave += r.leave;
      totalMarked += r.total;
    });

    const avgRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    return {
      daysRecorded: dailyRows.length,
      avgRate: `${avgRate}%`,
      totalPresent,
      totalAbsentOrLeave: totalAbsent + totalLeave,
    };
  }, [dailyRows]);

  const handleExportExcel = () => {
    downloadExcelFile({
      filename: `Class_${className}_Attendance_${selectedMonth}`,
      sheetName: `Month_${selectedMonth}`,
      title: `Class ${className} — Monthly Attendance (${selectedMonth})`,
      headers: ["Date", "Day", "Total Marked", "Present (P)", "Absent (A)", "Leave (L)", "Attendance %"],
      rows: dailyRows.map((r) => [
        r.date,
        r.dayName,
        r.total,
        r.present,
        r.absent,
        r.leave,
        `${r.rate}%`,
      ]),
    });
  };

  const isLoading = isClassLoading || isAttendanceLoading;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link to="/attendance">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Classes Attendance
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow={`Class ${className || "..."} · Monthly Register`}
        title={className ? `Class ${className} — Monthly Attendance` : "Class Monthly Attendance"}
        description="Click any date row to view or update that day's student-by-student attendance details."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={dailyRows.length === 0}
              className="gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </Button>
            <Button
              asChild
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              <Link to={`/classes/${id}/attendance`}>
                <Plus className="h-4 w-4" /> Mark Today&apos;s Attendance
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Days Recorded"
          value={isLoading ? "..." : monthSummary.daysRecorded}
          sub={`Month: ${selectedMonth}`}
          icon={CalendarCheck}
          variant="primary"
        />
        <StatCard
          label="Monthly Attendance %"
          value={isLoading ? "..." : monthSummary.avgRate}
          sub="Average present rate"
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          label="Total Present Marks"
          value={isLoading ? "..." : monthSummary.totalPresent}
          sub="Across recorded days"
          icon={Clock}
          variant="info"
        />
        <StatCard
          label="Absent & Leave"
          value={isLoading ? "..." : monthSummary.totalAbsentOrLeave}
          sub="Combined absences & leaves"
          icon={UserX}
          variant="warning"
        />
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/20 pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Daily Attendance Log — {selectedMonth}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Select a row to open that day&apos;s full roll call & leave reasons
            </p>
          </div>

          <div className="relative flex items-center">
            <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-primary pointer-events-none" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-8 h-9 w-[170px] text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : dailyRows.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3 text-sm text-muted-foreground p-6 text-center">
              <p>No attendance records found for Class {className} in {selectedMonth}.</p>
              <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0">
                <Link to={`/classes/${id}/attendance`}>Mark Attendance Now</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40 border-b">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Date</th>
                    <th className="px-5 py-3.5 font-semibold">Day</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Total</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Present (P)</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Absent (A)</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Leave (L)</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Attendance %</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {dailyRows.map((row) => (
                    <tr
                      key={row.date}
                      onClick={() => navigate(`/classes/${id}/attendance?date=${row.date}`)}
                      className="cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-semibold text-foreground">{row.date}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{row.dayName}</td>
                      <td className="px-5 py-3.5 text-center font-medium">{row.total}</td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/15 text-emerald-700 border-0"
                        >
                          {row.present}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge
                          variant="secondary"
                          className="bg-rose-500/15 text-rose-700 border-0"
                        >
                          {row.absent}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/15 text-amber-700 border-0"
                        >
                          {row.leave}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold text-primary">
                        {row.rate}%
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1.5 text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/classes/${id}/attendance?date=${row.date}`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" /> View Day
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClassMonthlyAttendancePage;
