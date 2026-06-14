import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CalendarCheck, UserCheck, UserX, Clock } from "lucide-react";
import { students } from "@/data/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily ops"
        title="Attendance"
        description="Mark today's attendance class by class."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Present Today"
          value="1,189"
          icon={UserCheck}
          variant="success"
          trend={2}
        />
        <StatCard label="Absent" value="42" icon={UserX} variant="warning" trend={-5} />
        <StatCard label="On Leave" value="14" icon={Clock} variant="info" />
        <StatCard
          label="Attendance %"
          value="95.5%"
          icon={CalendarCheck}
          variant="primary"
          trend={1}
        />
      </div>
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Class 10 - A · Today</h3>
          <Button className="gradient-primary text-primary-foreground border-0">
            Save Attendance
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-smooth"
            >
              <Avatar>
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                  {s.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">Roll #{s.rollNo}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-success/40 text-success hover:bg-success/10"
                >
                  P
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  A
                </Button>
                <Button size="sm" variant="outline">
                  L
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default AttendancePage;
