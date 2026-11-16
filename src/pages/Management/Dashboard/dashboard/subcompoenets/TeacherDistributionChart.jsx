import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetTeachersQuery } from "@/services/private/teacherService";
import { downloadExcelFile } from "@/utils/excelExport";
import { Loader2, Users, ArrowUpRight, BookOpen, RefreshCw, FileSpreadsheet } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-semibold text-sm text-foreground mb-1">{label}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>
          Total Teachers:{" "}
          <span className="font-semibold text-foreground">{item.count}</span>
        </p>
        <p>
          Active:{" "}
          <span className="font-semibold text-success">{item.activeCount}</span>
          {item.count - item.activeCount > 0 && (
            <span className="ml-1.5">
              · Other: <span className="font-semibold">{item.count - item.activeCount}</span>
            </span>
          )}
        </p>
        <p>
          Weekly Workload:{" "}
          <span className="font-semibold text-foreground">{item.totalWorkload} hrs</span>
        </p>
      </div>
    </div>
  );
}

export function TeacherDistributionChart() {
  const [groupBy, setGroupBy] = useState("subject");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: teachersData, isLoading, isError, refetch } = useGetTeachersQuery();

  const { chartData, filteredTeachers, activeCount } = useMemo(() => {
    const teachers = teachersData?.teachers || teachersData?.data || [];

    const filtered = teachers.filter((t) => {
      if (statusFilter === "all") return true;
      return String(t.status || "Active").toLowerCase() === statusFilter.toLowerCase();
    });

    const activeTotal = filtered.filter(
      (t) => String(t.status || "Active").toLowerCase() === "active"
    ).length;

    const groups = {};
    filtered.forEach((t) => {
      const rawKey =
        groupBy === "department"
          ? t.department || "Unassigned"
          : t.subject || "Unassigned";
      const key = String(rawKey).trim() || "Unassigned";

      if (!groups[key]) {
        groups[key] = {
          name: key,
          count: 0,
          activeCount: 0,
          totalWorkload: 0,
          teachers: [],
        };
      }

      groups[key].count += 1;
      if (String(t.status || "Active").toLowerCase() === "active") {
        groups[key].activeCount += 1;
      }
      groups[key].totalWorkload += Number(t.weeklyWorkload || 0);
      groups[key].teachers.push(t);
    });

    const sorted = Object.values(groups).sort((a, b) => b.count - a.count);

    return {
      chartData: sorted,
      filteredTeachers: filtered,
      activeCount: activeTotal,
    };
  }, [teachersData, groupBy, statusFilter]);

  const selectedGroupData = useMemo(() => {
    if (!selectedGroup) return null;
    return chartData.find((g) => g.name === selectedGroup) || null;
  }, [chartData, selectedGroup]);

  const handleGroupByChange = (val) => {
    setGroupBy(val);
    setSelectedGroup(null);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setSelectedGroup(null);
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            Teacher Distribution by {groupBy === "department" ? "Department" : "Subject"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading faculty distribution..."
              : `${filteredTeachers.length} faculty · ${activeCount} active · ${chartData.length} ${
                  groupBy === "department" ? "departments" : "subjects"
                }`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={groupBy} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-[145px] h-9 text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subject">By Subject</SelectItem>
              <SelectItem value="department">By Department</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
            disabled={chartData.length === 0}
            onClick={() =>
              downloadExcelFile({
                filename: `Teacher_Distribution_By_${groupBy}`,
                sheetName: "Distribution",
                title: `Teacher Distribution by ${groupBy === "department" ? "Department" : "Subject"}`,
                headers: [
                  groupBy === "department" ? "Department" : "Subject",
                  "Total Teachers",
                  "Active Teachers",
                  "Weekly Workload (hrs)",
                ],
                rows: chartData.map((g) => [g.name, g.count, g.activeCount, g.totalWorkload]),
              })
            }
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Excel
          </Button>

          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" asChild>
            <Link to="/teachers">
              <Users className="h-3.5 w-3.5" />
              Manage Faculty
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[240px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>Failed to load teacher distribution.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>No teachers found for the selected filter.</p>
          {statusFilter !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => handleStatusChange("all")}>
              Clear filter
            </Button>
          )}
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                allowDecimals={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ r: 5, fill: "var(--chart-2)" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chartData.map((group) => {
              const isSelected = selectedGroup === group.name;
              return (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => setSelectedGroup(isSelected ? null : group.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span>{group.name}</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    {group.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {selectedGroupData && (
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">
                  {selectedGroupData.name} Faculty ({selectedGroupData.teachers.length})
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedGroup(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {selectedGroupData.teachers.map((t) => (
                  <Link
                    key={t.id}
                    to={`/teachers/details/${t.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {t.fullName || t.name}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {t.designation || t.subject} · {t.weeklyWorkload || 0} hrs/wk
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-2 shrink-0 text-[10px] ${
                        String(t.status || "Active").toLowerCase() === "active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {t.status || "Active"}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
