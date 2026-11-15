import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useGetStudentsQuery } from "@/services/private/studentService";
import { useGetTeachersQuery } from "@/services/private/teacherService";
import { Loader2 } from "lucide-react";

const PIE_COLORS = [
  "oklch(0.55 0.22 280)",
  "oklch(0.7 0.18 320)",
  "oklch(0.65 0.18 200)",
  "oklch(0.72 0.16 155)",
];

export function UserRolesChart() {
  const user = useSelector((state) => state.auth.user);
  const { data: studentsData, isLoading: isStudentsLoading } = useGetStudentsQuery({ limit: 1000 });
  const { data: teachersData, isLoading: isTeachersLoading } = useGetTeachersQuery();

  const isLoading = isStudentsLoading || isTeachersLoading;

  const roleData = useMemo(() => {
    const students = studentsData?.students || [];
    const totalStudents = studentsData?.total ?? students.length;

    const teachers = teachersData?.teachers || [];
    const fullTimeTeachers = teachers.filter(
      (t) => String(t.employmentType || t.type || "Full-time").toLowerCase() === "full-time"
    ).length;
    const partTimeTeachers = Math.max(0, teachers.length - fullTimeTeachers);

    const items = [
      { name: "Students", value: totalStudents },
      { name: "Full-time Teachers", value: fullTimeTeachers },
      ...(partTimeTeachers > 0 ? [{ name: "Part-time / Visiting", value: partTimeTeachers }] : []),
      { name: user?.role || "Super Admin", value: 1 },
    ];

    return items;
  }, [studentsData, teachersData, user?.role]);

  const totalCount = roleData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">User Roles</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Live distribution across system ({totalCount.toLocaleString()} total)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[260px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={roleData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {roleData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {roleData.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {r.name}
                </div>
                <span className="font-semibold">{r.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
