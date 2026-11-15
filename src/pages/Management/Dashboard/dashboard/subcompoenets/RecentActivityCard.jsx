import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useGetStudentsQuery } from "@/services/private/studentService";
import { useGetTeachersQuery } from "@/services/private/teacherService";
import { useGetFeesQuery } from "@/services/private/feeService";
import { useGetNoticesQuery, useGetEventsQuery } from "@/services/private/resourceService";
import {
  UserPlus,
  Wallet,
  BookOpen,
  Bell,
  CalendarDays,
  Loader2,
} from "lucide-react";

function formatRelativeTime(dateVal) {
  if (!dateVal) return "Recently";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return String(dateVal);

  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function RecentActivityCard() {
  const { data: studentsRes, isLoading: isStudentsLoading } = useGetStudentsQuery({ limit: 20 });
  const { data: teachersRes, isLoading: isTeachersLoading } = useGetTeachersQuery();
  const { data: feesRes, isLoading: isFeesLoading } = useGetFeesQuery({ limit: 20 });
  const { data: noticesRes, isLoading: isNoticesLoading } = useGetNoticesQuery();
  const { data: eventsRes, isLoading: isEventsLoading } = useGetEventsQuery();

  const isLoading =
    isStudentsLoading || isTeachersLoading || isFeesLoading || isNoticesLoading || isEventsLoading;

  const activities = useMemo(() => {
    const items = [];

    (studentsRes?.students || []).slice(0, 5).forEach((s) => {
      const ts = s.createdAt || s.admissionDate || s.updatedAt;
      items.push({
        id: `student-${s.id}`,
        text: `Student enrolled: ${s.fullName || s.name} (Class ${s.class}${s.section ? `-${s.section}` : ""})`,
        time: formatRelativeTime(ts),
        sortTime: ts ? new Date(ts).getTime() : 0,
        icon: UserPlus,
        to: `/students/details/${s.id}`,
      });
    });

    (feesRes?.data || []).slice(0, 5).forEach((f) => {
      const ts = f.updatedAt || f.paymentDate || f.createdAt;
      const studentName = f.studentName || f.studentId?.fullName || f.studentId?.name || "Student";
      items.push({
        id: `fee-${f.id}`,
        text: `Fee ${String(f.status || "Paid").toLowerCase()}: Rs. ${Number(f.amount || 0).toLocaleString()} (${studentName})`,
        time: formatRelativeTime(ts),
        sortTime: ts ? new Date(ts).getTime() : 0,
        icon: Wallet,
        to: f.studentId?.id ? `/students/details/${f.studentId.id}` : "/fees",
      });
    });

    (teachersRes?.teachers || []).slice(0, 4).forEach((t) => {
      const ts = t.createdAt || t.joiningDate;
      items.push({
        id: `teacher-${t.id}`,
        text: `Faculty member: ${t.fullName || t.name} (${t.subject})`,
        time: formatRelativeTime(ts),
        sortTime: ts ? new Date(ts).getTime() : 0,
        icon: BookOpen,
        to: `/teachers/details/${t.id}`,
      });
    });

    (noticesRes?.data || []).slice(0, 4).forEach((n) => {
      const ts = n.createdAt || n.publishedDate;
      items.push({
        id: `notice-${n.id}`,
        text: `Notice published: ${n.title}`,
        time: formatRelativeTime(ts),
        sortTime: ts ? new Date(ts).getTime() : 0,
        icon: Bell,
        to: `/notice/${n.id}`,
      });
    });

    (eventsRes?.data || []).slice(0, 4).forEach((ev) => {
      const ts = ev.createdAt || ev.date;
      items.push({
        id: `event-${ev.id}`,
        text: `Event scheduled: ${ev.title} (${ev.date})`,
        time: formatRelativeTime(ts),
        sortTime: ts ? new Date(ts).getTime() : 0,
        icon: CalendarDays,
        to: `/event-calendar/${ev.id}`,
      });
    });

    return items
      .sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0))
      .slice(0, 6);
  }, [studentsRes, teachersRes, feesRes, noticesRes, eventsRes]);

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-semibold text-lg">Recent Activity</h3>
      <p className="text-sm text-muted-foreground mb-4">Live system events</p>

      {isLoading ? (
        <div className="flex h-[240px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          No recent activity recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.id}
                to={a.to}
                className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-muted/60 transition-smooth cursor-pointer"
              >
                <div className="h-8 w-8 shrink-0 rounded-full gradient-primary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
