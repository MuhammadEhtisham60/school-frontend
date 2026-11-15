import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/ui/stat-card";
import {
  useGetTeachersQuery,
  useDeleteTeacherMutation,
  useGetAllTeacherSalariesQuery,
  useCreateTeacherSalaryMutation,
  useUpdateTeacherSalaryMutation,
  useDeleteTeacherSalaryMutation,
  useGetTeacherLeavesQuery,
  useCreateTeacherLeaveMutation,
  useUpdateTeacherLeaveMutation,
  useDeleteTeacherLeaveMutation,
  useGetTeacherAttendanceQuery,
  useSaveTeacherAttendanceMutation,
} from "@/services/private/teacherService";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import {
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  Mail,
  Phone,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  LayoutGrid,
  List,
  Wallet,
  CalendarCheck,
  UserCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  Award,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  downloadTeacherListPDF,
  downloadTeacherProfilePDF,
  downloadTeacherSalarySlipPDF,
} from "@/utils/pdfGenerator";
import { TeacherFormDialog } from "./TeacherFormDialog";

const MONTHS_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEPARTMENTS = [
  "Mathematics",
  "Science",
  "Languages",
  "Computer Science",
  "Humanities",
  "Islamiat & Urdu",
  "Early Childhood",
  "Commerce & Arts",
  "Physical Education",
];

const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const base = (import.meta.env.VITE_APP_API_URL || "http://localhost:8000/api/").replace(
    /\/api\/?$/,
    ""
  );
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function TeachersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialClass = queryParams.get("class") || "all";

  // Directory Filters & View State
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [classFilter, setClassFilter] = useState(initialClass);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salaryStatusFilter, setSalaryStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // Add / Edit Teacher Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);

  // Queries
  const { data: classesResponse } = useGetClassesDropdownQuery();
  const classesList = classesResponse?.data || [];

  const { data, isLoading, error } = useGetTeachersQuery({
    search: search || undefined,
    department: departmentFilter !== "all" ? departmentFilter : undefined,
    class: classFilter !== "all" ? classFilter : undefined,
    employmentType: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const rawTeachers = useMemo(() => {
    const list = data?.teachers || [];
    if (deletedIds.length === 0) return list;
    return list.filter((t) => !deletedIds.includes(String(t.id)));
  }, [data?.teachers, deletedIds]);

  const teachersList = useMemo(() => {
    if (salaryStatusFilter === "all") return rawTeachers;
    return rawTeachers.filter(
      (t) => String(t.salaryStatus || "Paid").toLowerCase() === salaryStatusFilter.toLowerCase()
    );
  }, [rawTeachers, salaryStatusFilter]);

  // KPI Metrics
  const totalTeachers = rawTeachers.length;
  const activeTeachers = rawTeachers.filter(
    (t) => String(t.status || "Active").toLowerCase() === "active"
  ).length;
  const fullTimeTeachers = rawTeachers.filter(
    (t) => String(t.employmentType || t.type || "").toLowerCase() === "full-time"
  ).length;
  const onLeaveTeachers = rawTeachers.filter(
    (t) => String(t.status || "").toLowerCase() !== "active"
  ).length;
  const totalMonthlyPayroll = rawTeachers.reduce((sum, t) => sum + (Number(t.salary) || 0), 0);

  // ==========================================
  // PAYROLL REGISTER TAB STATE
  // ==========================================
  const [payrollMonth, setPayrollMonth] = useState("all");
  const [payrollStatus, setPayrollStatus] = useState("all");
  const { data: salariesData, isLoading: isSalariesLoading } = useGetAllTeacherSalariesQuery({
    month: payrollMonth !== "all" ? payrollMonth : undefined,
    status: payrollStatus !== "all" ? payrollStatus : undefined,
    limit: 200,
  });
  const allSalaries = salariesData?.data || [];

  const [createSalary, { isLoading: isCreatingSalary }] = useCreateTeacherSalaryMutation();
  const [updateSalary] = useUpdateTeacherSalaryMutation();
  const [deleteSalary] = useDeleteTeacherSalaryMutation();

  const [isAddSalaryOpen, setIsAddSalaryOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    teacherId: "",
    month: "November",
    year: "2026",
    basicSalary: "",
    allowances: "",
    bonus: 0,
    deductions: "",
    netAmount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    status: "Paid",
    remarks: "",
  });

  const handleSelectSalaryTeacher = (tid) => {
    const t = rawTeachers.find((x) => String(x.id) === String(tid));
    const basic = Number(t?.basicSalary ?? t?.salary ?? 0);
    const allow = Number(t?.allowances ?? 0);
    const ded = Number(t?.deductions ?? 0);
    setSalaryForm({
      ...salaryForm,
      teacherId: tid,
      basicSalary: basic,
      allowances: allow,
      deductions: ded,
      netAmount: Math.max(0, basic + allow - ded),
      paymentMethod: t?.paymentMethod || "Bank Transfer",
    });
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!salaryForm.teacherId) {
      toast.error("Please select a teacher");
      return;
    }
    try {
      await createSalary(salaryForm).unwrap();
      toast.success("Salary record created!");
      setIsAddSalaryOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create salary record");
    }
  };

  const handleQuickDisburse = async (sal) => {
    try {
      await updateSalary({
        id: sal.id,
        teacherId: sal.teacherId?.id,
        body: {
          status: "Paid",
          paymentDate: new Date().toISOString().split("T")[0],
          remarks: "Salary disbursed and verified",
        },
      }).unwrap();
      toast.success(`Salary disbursed for ${sal.teacherId?.name} (${sal.month})`);
    } catch (err) {
      toast.error("Failed to disburse salary");
    }
  };

  const handleDeleteSalary = async (sal) => {
    try {
      await deleteSalary({ id: sal.id, teacherId: sal.teacherId?.id }).unwrap();
      toast.success("Salary record deleted");
    } catch (err) {
      toast.error("Failed to delete salary record");
    }
  };

  // ==========================================
  // ATTENDANCE & LEAVES TAB STATE
  // ==========================================
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: attendanceData } = useGetTeacherAttendanceQuery({ date: attDate });
  const [saveAttendance, { isLoading: isSavingAttendance }] = useSaveTeacherAttendanceMutation();
  const [dailyRecords, setDailyRecords] = useState({});

  useEffect(() => {
    const existingList = attendanceData?.data || [];
    const map = {};
    rawTeachers.forEach((t) => {
      const found = existingList.find((r) => String(r.teacherId?.id) === String(t.id));
      map[t.id] = {
        teacherId: t.id,
        status: found?.status || (t.status === "On Leave" ? "Leave" : "Present"),
        checkIn: found?.checkIn || (t.status === "On Leave" ? "—" : "07:55 AM"),
        checkOut: found?.checkOut || (t.status === "On Leave" ? "—" : "02:00 PM"),
        remarks: found?.remarks || "",
      };
    });
    setDailyRecords(map);
  }, [rawTeachers, attendanceData]);

  const handleMarkAllPresent = () => {
    const next = {};
    rawTeachers.forEach((t) => {
      next[t.id] = {
        teacherId: t.id,
        status: "Present",
        checkIn: "07:55 AM",
        checkOut: "02:00 PM",
        remarks: "On time",
      };
    });
    setDailyRecords(next);
    toast.info("All faculty marked Present — click Save Attendance to persist.");
  };

  const handleSaveBulkAttendance = async () => {
    try {
      await saveAttendance({
        date: attDate,
        records: Object.values(dailyRecords),
      }).unwrap();
      toast.success(`Faculty attendance saved for ${attDate}!`);
    } catch (err) {
      toast.error("Failed to save faculty attendance");
    }
  };

  const { data: leavesData } = useGetTeacherLeavesQuery();
  const allLeaves = leavesData?.data || [];
  const [createLeave, { isLoading: isCreatingLeave }] = useCreateTeacherLeaveMutation();
  const [updateLeave] = useUpdateTeacherLeaveMutation();
  const [deleteLeave] = useDeleteTeacherLeaveMutation();
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    teacherId: "",
    leaveType: "Casual Leave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    days: 1,
    reason: "",
    status: "Approved",
  });

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.teacherId) {
      toast.error("Select a teacher");
      return;
    }
    try {
      await createLeave(leaveForm).unwrap();
      toast.success("Leave request recorded!");
      setIsLeaveOpen(false);
    } catch (err) {
      toast.error("Failed to save leave");
    }
  };

  // Directory Handlers
  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormOpen(true);
  };

  const triggerDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deleteId) return;
    const idToDelete = deleteId;
    const nameToDelete = deleteName;
    try {
      await deleteTeacher(idToDelete).unwrap();
      setDeletedIds((prev) => [...prev, String(idToDelete)]);
      toast.success(`${nameToDelete} deleted from faculty directory!`);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      setDeleteName("");
    } catch (err) {
      toast.error(err?.data?.message || `Failed to delete ${nameToDelete}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Faculty & HR Operations"
        title="Teachers Management"
        description="Manage faculty profiles, subject & class assignments, monthly payroll, and attendance."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={teachersList.length === 0}
              onClick={() => {
                downloadTeacherListPDF(teachersList, {
                  departmentFilter,
                  classFilter,
                  typeFilter,
                  statusFilter,
                });
                toast.success("Faculty directory & payroll register PDF downloaded!");
              }}
              className="gap-2 font-semibold"
            >
              <Download className="h-4 w-4 text-primary" /> Export Faculty PDF
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow font-semibold"
            >
              <Plus className="h-4 w-4" /> Add Teacher
            </Button>
          </div>
        }
      />

      {/* Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Faculty"
          value={totalTeachers}
          icon={BookOpen}
          variant="primary"
          sub={`${fullTimeTeachers} Full-time · ${totalTeachers - fullTimeTeachers} Part-time`}
        />
        <StatCard
          label="Active Teachers"
          value={activeTeachers}
          icon={UserCheck}
          variant="success"
          sub="Currently teaching"
        />
        <StatCard
          label="Monthly Payroll"
          value={`Rs. ${totalMonthlyPayroll.toLocaleString()}`}
          icon={Wallet}
          variant="info"
          sub="Total net compensation"
        />
        <StatCard
          label="On Leave / Inactive"
          value={onLeaveTeachers}
          icon={Clock}
          variant="warning"
          sub="Approved leave or inactive"
        />
      </div>

      {/* Main Section Tabs */}
      <Tabs defaultValue="directory" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-muted rounded-xl p-1">
            <TabsTrigger value="directory" className="px-4 py-2 text-xs font-semibold gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Faculty Directory ({teachersList.length})
            </TabsTrigger>
            <TabsTrigger value="payroll" className="px-4 py-2 text-xs font-semibold gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Payroll & Salaries ({allSalaries.length})
            </TabsTrigger>
            <TabsTrigger value="attendance" className="px-4 py-2 text-xs font-semibold gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" /> Attendance & Leaves
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1 self-end sm:self-auto bg-muted p-1 rounded-lg">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1"
              onClick={() => setViewMode("table")}
            >
              <List className="h-3.5 w-3.5" /> Table
            </Button>
          </div>
        </div>

        {/* ========================================== */}
        {/* TAB 1: FACULTY DIRECTORY                   */}
        {/* ========================================== */}
        <TabsContent value="directory" className="space-y-6">
          <ListToolbar
            search={search}
            setSearch={setSearch}
            onAdd={handleOpenAdd}
            addLabel="Add Teacher"
          >
            <div className="flex flex-wrap gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[145px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classesList.map((c) => (
                    <SelectItem key={c._id || c.id} value={c.name}>
                      Class {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Visiting">Visiting</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={salaryStatusFilter} onValueChange={setSalaryStatusFilter}>
                <SelectTrigger className="w-[135px]">
                  <SelectValue placeholder="Payroll" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payroll</SelectItem>
                  <SelectItem value="Paid">Salary Paid</SelectItem>
                  <SelectItem value="Pending">Salary Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListToolbar>

          {isLoading ? (
            <Card className="p-12 flex justify-center items-center shadow-card">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading faculty directory...
                </p>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive shadow-card">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load teachers</p>
                <p className="text-sm opacity-90">
                  {error?.data?.message || "An unexpected error occurred"}
                </p>
              </div>
            </Card>
          ) : teachersList.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-semibold">No faculty members match your filter criteria</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try clearing filters or click "Add Teacher" to onboard a new faculty member.
              </p>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teachersList.map((t) => (
                <Card
                  key={t.id}
                  className="p-5 card-hover shadow-card relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full opacity-20 blur-2xl gradient-primary pointer-events-none" />
                  <div>
                    <div className="flex items-start gap-4 relative">
                      <Avatar
                        className="h-14 w-14 ring-2 ring-primary/20 cursor-pointer"
                        onClick={() => navigate(`/teachers/details/${t.id}`)}
                      >
                        <AvatarImage src={getMediaUrl(t.photo)} />
                        <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                          {getInitials(t.fullName || t.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3
                                className="font-bold truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/teachers/details/${t.id}`)}
                              >
                                {t.fullName || t.name}
                              </h3>
                            </div>
                            <p className="text-xs text-primary font-semibold truncate">
                              {t.designation || "Senior Teacher"} · {t.subject}
                            </p>
                          </div>
                          <StatusBadge status={t.status || "Active"} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                            {t.employeeId || `EMP-${t.id}`}
                          </span>
                          <span className="truncate">
                            {t.qualification || "MSc"} · {t.experience || 1} yrs exp.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                      <div className="p-2 rounded-lg bg-muted/40">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                          Net Salary
                        </p>
                        <p className="font-bold text-xs mt-0.5">
                          Rs. {Number(t.salary || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                          Type
                        </p>
                        <p className="font-semibold text-xs mt-0.5">
                          {t.employmentType || t.type || "Full-time"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                          Payroll
                        </p>
                        <div className="mt-0.5">
                          <StatusBadge status={t.salaryStatus || "Paid"} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {t.classTeacherOf && (
                        <Badge className="gradient-primary text-primary-foreground border-0 text-[10px]">
                          In-Charge: {t.classTeacherOf}
                        </Badge>
                      )}
                      {(t.classes || []).map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="bg-accent text-accent-foreground border-0 text-[11px] cursor-pointer"
                          onClick={() => setClassFilter(String(c))}
                        >
                          Class {c}
                        </Badge>
                      ))}
                      {(t.classes || []).length === 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          No classes assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0 text-primary" /> {t.email || "—"}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Phone className="h-3 w-3 text-primary" /> {t.phone}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-xs font-semibold"
                        onClick={() => navigate(`/teachers/details/${t.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-xs font-semibold"
                        onClick={() => handleOpenEdit(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Delete Teacher"
                        className="gap-1 text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDelete(t.id, t.fullName || t.name);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" /> Delete
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Download Profile PDF"
                        onClick={() => {
                          downloadTeacherProfilePDF(t);
                          toast.success(`Profile PDF downloaded for ${t.fullName || t.name}`);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Faculty Member</TableHead>
                    <TableHead>Emp ID</TableHead>
                    <TableHead>Department & Subject</TableHead>
                    <TableHead>Assigned Classes</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Payroll</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachersList.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                            <AvatarImage src={getMediaUrl(t.photo)} />
                            <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                              {getInitials(t.fullName || t.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p
                              className="font-semibold cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/teachers/details/${t.id}`)}
                            >
                              {t.fullName || t.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t.designation} · {t.qualification} ({t.experience}y)
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        {t.employeeId || `EMP-${t.id}`}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-primary text-sm">{t.subject}</p>
                        <p className="text-xs text-muted-foreground">{t.department}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(t.classes || []).map((c) => (
                            <Badge key={c} variant="secondary" className="text-[10px]">
                              Class {c}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p>{t.phone}</p>
                        <p className="text-muted-foreground">{t.email}</p>
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rs. {Number(t.salary || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.salaryStatus || "Paid"} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status || "Active"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/teachers/details/${t.id}`)}
                            title="View Full Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(t)}
                            title="Edit Teacher"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => triggerDelete(t.id, t.fullName || t.name)}
                            title="Delete Teacher"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: PAYROLL & SALARY REGISTER           */}
        {/* ========================================== */}
        <TabsContent value="payroll" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" /> Faculty Monthly Payroll Register
                </CardTitle>
                <CardDescription>
                  Disburse monthly salaries, track pending dues, and generate official salary slips.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={payrollMonth} onValueChange={setPayrollMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS_ORDER.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={payrollStatus} onValueChange={setPayrollStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setIsAddSalaryOpen(true)}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0"
                >
                  <Plus className="h-4 w-4" /> Record Salary
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isSalariesLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Teacher</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Basic</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSalaries.map((sal) => (
                      <TableRow key={sal.id} className="hover:bg-muted/20">
                        <TableCell>
                          <p
                            className="font-semibold cursor-pointer hover:text-primary"
                            onClick={() => navigate(`/teachers/details/${sal.teacherId?.id}`)}
                          >
                            {sal.teacherId?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sal.teacherId?.employeeId} · {sal.teacherId?.subject}
                          </p>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {sal.month} {sal.year}
                        </TableCell>
                        <TableCell>Rs. {Number(sal.basicSalary || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          +Rs. {Number(sal.allowances || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-success">
                          +Rs. {Number(sal.bonus || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-destructive">
                          -Rs. {Number(sal.deductions || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          Rs. {Number(sal.netAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sal.paymentDate || "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={sal.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs gap-1 font-semibold text-primary"
                              onClick={() => {
                                downloadTeacherSalarySlipPDF(sal);
                                toast.success(`Salary slip PDF downloaded for ${sal.teacherId?.name}`);
                              }}
                            >
                              <Download className="h-3 w-3" /> Slip PDF
                            </Button>
                            {String(sal.status || "").toLowerCase() === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1 text-success border-success/40"
                                onClick={() => handleQuickDisburse(sal)}
                              >
                                <CreditCard className="h-3 w-3" /> Pay
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteSalary(sal)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allSalaries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                          No payroll records found for the selected filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: FACULTY ATTENDANCE & LEAVES         */}
        {/* ========================================== */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Attendance Sheet */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" /> Daily Faculty Attendance
                  </CardTitle>
                  <CardDescription>Mark daily attendance for all teachers</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-[150px] h-9 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMarkAllPresent}
                    className="h-9 text-xs"
                  >
                    All Present
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSavingAttendance}
                    onClick={handleSaveBulkAttendance}
                    className="h-9 text-xs gradient-primary text-primary-foreground border-0"
                  >
                    {isSavingAttendance && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                    Save Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {rawTeachers.map((t) => {
                  const rec = dailyRecords[t.id] || { status: "Present" };
                  return (
                    <div
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-muted/10"
                    >
                      <div>
                        <p className="font-semibold text-sm">{t.fullName || t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.employeeId} · {t.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {["Present", "Absent", "Late", "Leave"].map((st) => {
                          const active = rec.status === st;
                          return (
                            <Button
                              key={st}
                              type="button"
                              size="sm"
                              variant={active ? "default" : "outline"}
                              className={`h-7 px-2.5 text-xs ${
                                active ? "gradient-primary text-primary-foreground border-0" : ""
                              }`}
                              onClick={() =>
                                setDailyRecords({
                                  ...dailyRecords,
                                  [t.id]: { ...rec, teacherId: t.id, status: st },
                                })
                              }
                            >
                              {st}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Leave Applications Management */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-base font-bold">Leave Requests & Approvals</CardTitle>
                  <CardDescription>Approve or record teacher leave applications</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsLeaveOpen(true)}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0"
                >
                  <Plus className="h-4 w-4" /> Add Leave
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {allLeaves.length === 0 ? (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No leave applications recorded.
                  </p>
                ) : (
                  allLeaves.map((lv) => (
                    <div
                      key={lv.id}
                      className="p-3.5 rounded-xl border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{lv.teacherId?.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {lv.leaveType} ({lv.days}d)
                          </Badge>
                          <StatusBadge status={lv.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lv.startDate} to {lv.endDate} — {lv.reason || "Personal reason"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        {lv.status !== "Approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-success gap-1"
                            onClick={async () => {
                              await updateLeave({ id: lv.id, body: { status: "Approved" } });
                              toast.success("Leave approved");
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {lv.status !== "Rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-warning gap-1"
                            onClick={async () => {
                              await updateLeave({ id: lv.id, body: { status: "Rejected" } });
                              toast.info("Leave rejected");
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={async () => {
                            await deleteLeave(lv.id);
                            toast.success("Leave deleted");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Teacher Dialog */}
      <TeacherFormDialog open={formOpen} setOpen={setFormOpen} teacher={editingTeacher} />

      {/* Record Monthly Salary Dialog */}
      <Dialog open={isAddSalaryOpen} onOpenChange={setIsAddSalaryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Teacher Monthly Salary</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSalary} className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Select Teacher *</Label>
              <select
                value={salaryForm.teacherId}
                onChange={(e) => handleSelectSalaryTeacher(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="" disabled>
                  Select Faculty Member...
                </option>
                {rawTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName || t.name} ({t.employeeId} - Rs.{" "}
                    {Number(t.salary || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Month</Label>
                <select
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {MONTHS_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Net Payable (Rs.)</Label>
                <Input
                  type="number"
                  value={salaryForm.netAmount}
                  onChange={(e) => setSalaryForm({ ...salaryForm, netAmount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={salaryForm.status}
                  onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={salaryForm.paymentDate}
                  onChange={(e) => setSalaryForm({ ...salaryForm, paymentDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddSalaryOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingSalary}
                className="gradient-primary text-primary-foreground border-0"
              >
                Save Payroll Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Leave Dialog */}
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Faculty Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLeave} className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Select Teacher *</Label>
              <select
                value={leaveForm.teacherId}
                onChange={(e) => setLeaveForm({ ...leaveForm, teacherId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="" disabled>
                  Select Teacher...
                </option>
                {rawTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName || t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Leave Type</Label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Official Duty">Official Duty</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Days</Label>
                <Input
                  type="number"
                  min="1"
                  value={leaveForm.days}
                  onChange={(e) => setLeaveForm({ ...leaveForm, days: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Reason</Label>
                <Textarea
                  rows={2}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Reason for leave..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLeaveOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingLeave}
                className="gradient-primary text-primary-foreground border-0"
              >
                Save Leave
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteName}</strong> and their associated
              payroll and attendance records from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Teacher
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeachersPage;
