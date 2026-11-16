import { useMemo } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { useGetStudentsQuery } from "@/services/private/studentService";
import { useGetTeachersQuery } from "@/services/private/teacherService";
import { useGetClassesQuery } from "@/services/private/classService";
import { useGetFeesQuery } from "@/services/private/feeService";
import { GraduationCap, BookOpen, Layers, Wallet } from "lucide-react";

const formatCurrencyCompact = (amount) => {
  const num = Number(amount || 0);
  if (num >= 1_000_000) {
    return `PKR ${(num / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  }
  if (num >= 1_000) {
    return `PKR ${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `PKR ${num.toLocaleString()}`;
};

export function DashboardKpiCards() {
  const { data: studentsData, isLoading: isStudentsLoading } = useGetStudentsQuery({ limit: 1000 });
  const { data: teachersData, isLoading: isTeachersLoading } = useGetTeachersQuery();
  const { data: classesData, isLoading: isClassesLoading } = useGetClassesQuery();
  const { data: feesData, isLoading: isFeesLoading } = useGetFeesQuery({ limit: 1000 });

  const metrics = useMemo(() => {
    const students = studentsData?.students || [];
    const totalStudents = studentsData?.total ?? students.length;
    const activeStudents = students.filter((s) => s.is_active !== false).length;

    const teachers = teachersData?.teachers || [];
    const totalTeachers = teachersData?.total ?? teachers.length;
    const activeTeachers = teachers.filter(
      (t) => String(t.status || "Active").toLowerCase() === "active"
    ).length;

    const classes = classesData?.data || [];
    const totalClasses = classes.length;
    const activeClasses = classes.filter((c) => c.isActive !== false).length;
    const totalSections = classes.reduce(
      (sum, c) => sum + (Array.isArray(c.sections) ? c.sections.length : 0),
      0
    );

    const fees = feesData?.data || [];
    let collectedAmount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    fees.forEach((f) => {
      const amt = Number(f.amount || 0);
      if (String(f.status || "").toLowerCase() === "paid") {
        collectedAmount += amt;
        paidCount += 1;
      } else {
        pendingAmount += amt;
      }
    });

    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalClasses,
      activeClasses,
      totalSections,
      collectedAmount,
      pendingAmount,
      paidCount,
    };
  }, [studentsData, teachersData, classesData, feesData]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Students"
        value={isStudentsLoading ? "..." : metrics.totalStudents.toLocaleString()}
        sub={
          isStudentsLoading
            ? "Loading student records..."
            : `${metrics.activeStudents} active · ${Math.max(0, metrics.totalStudents - metrics.activeStudents)} inactive`
        }
        icon={GraduationCap}
        variant="primary"
      />
      <StatCard
        label="Total Teachers"
        value={isTeachersLoading ? "..." : metrics.totalTeachers.toLocaleString()}
        sub={
          isTeachersLoading
            ? "Loading faculty records..."
            : `${metrics.activeTeachers} active · ${Math.max(0, metrics.totalTeachers - metrics.activeTeachers)} on leave`
        }
        icon={BookOpen}
        variant="info"
      />
      <StatCard
        label="Active Classes"
        value={isClassesLoading ? "..." : metrics.activeClasses.toLocaleString()}
        sub={
          isClassesLoading
            ? "Loading classes..."
            : `${metrics.totalClasses} total classes · ${metrics.totalSections} sections`
        }
        icon={Layers}
        variant="success"
      />
      <StatCard
        label="Fees Collected"
        value={isFeesLoading ? "..." : formatCurrencyCompact(metrics.collectedAmount)}
        sub={
          isFeesLoading
            ? "Loading fee ledger..."
            : `${metrics.paidCount} paid · ${formatCurrencyCompact(metrics.pendingAmount)} pending`
        }
        icon={Wallet}
        variant="warning"
      />
    </div>
  );
}
