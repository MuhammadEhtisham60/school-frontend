import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTeacherQuery,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeacherSalariesQuery,
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
import { useGetStudentsQuery } from "@/services/private/studentService";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/ListToolbar";
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
import {
  User,
  BookOpen,
  Phone,
  Briefcase,
  Building2,
  Clock,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Pencil,
  ArrowLeft,
  DollarSign,
  GraduationCap,
  CreditCard,
  Plus,
  Trash2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  downloadTeacherProfilePDF,
  downloadTeacherSalarySlipPDF,
  downloadTeacherSalaryStatementPDF,
} from "@/utils/pdfGenerator";
import { TeacherFormDialog } from "../TeacherFormDialog";

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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetTeacherQuery(id, { skip: !id });
  const teacher = data?.teacher;

  const { data: classesResponse } = useGetClassesDropdownQuery();
  const classesList = classesResponse?.data || [];

  const { data: studentsResponse } = useGetStudentsQuery({ limit: 500 });
  const allStudents = studentsResponse?.students || [];

  // Filter students belonging to this teacher's assigned classes
  const teacherStudents = useMemo(() => {
    if (!teacher?.classes || teacher.classes.length === 0) return [];
    const assignedSet = new Set(teacher.classes.map((c) => String(c).toLowerCase().trim()));
    return allStudents.filter((s) => assignedSet.has(String(s.class || "").toLowerCase().trim()));
  }, [allStudents, teacher?.classes]);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTeacher, { isLoading: isDeletingTeacher }] = useDeleteTeacherMutation();

  const handleDeleteTeacherConfirm = async () => {
    if (!teacher?.id) return;
    try {
      await deleteTeacher(teacher.id).unwrap();
      toast.success(`${teacher.fullName || teacher.name} deleted from faculty directory!`);
      setIsDeleteOpen(false);
      navigate("/teachers");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete teacher");
    }
  };

  // ==========================================
  // TIMETABLE / SCHEDULE STATE & MUTATION
  // ==========================================
  const [updateTeacher, { isLoading: isUpdatingTeacher }] = useUpdateTeacherMutation();
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [periodForm, setPeriodForm] = useState({
    day: "Monday",
    period: "1st Period",
    startTime: "08:00",
    endTime: "08:45",
    className: "10",
    section: "A",
    subject: "",
    room: "Room 101",
  });

  const handleOpenAddPeriod = () => {
    setEditingPeriodId(null);
    setPeriodForm({
      day: "Monday",
      period: "1st Period",
      startTime: "08:00",
      endTime: "08:45",
      className: teacher?.classes?.[0] || classesList?.[0]?.name || "10",
      section: "A",
      subject: teacher?.subject || "",
      room: "Room 101",
    });
    setIsPeriodOpen(true);
  };

  const handleOpenEditPeriod = (slot) => {
    setEditingPeriodId(slot.id);
    setPeriodForm({
      day: slot.day || "Monday",
      period: slot.period || "1st Period",
      startTime: slot.startTime || "08:00",
      endTime: slot.endTime || "08:45",
      className: slot.className || "10",
      section: slot.section || "A",
      subject: slot.subject || teacher?.subject || "",
      room: slot.room || "Room 101",
    });
    setIsPeriodOpen(true);
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    const currentSchedule = Array.isArray(teacher?.schedule) ? [...teacher.schedule] : [];
    let updatedSchedule;
    if (editingPeriodId) {
      updatedSchedule = currentSchedule.map((s) =>
        s.id === editingPeriodId ? { ...periodForm, id: editingPeriodId } : s
      );
    } else {
      updatedSchedule = [
        ...currentSchedule,
        { ...periodForm, id: `p_${Date.now()}` },
      ];
    }

    // Ensure class is also in teacher's assigned classes if not already
    const currentClasses = Array.isArray(teacher?.classes) ? [...teacher.classes] : [];
    if (periodForm.className && !currentClasses.includes(periodForm.className)) {
      currentClasses.push(periodForm.className);
    }

    try {
      await updateTeacher({
        id: teacher.id,
        body: {
          schedule: updatedSchedule,
          classes: currentClasses,
        },
      }).unwrap();
      toast.success(editingPeriodId ? "Schedule period updated!" : "Period added to timetable!");
      setIsPeriodOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update timetable");
    }
  };

  const handleDeletePeriod = async (slotId) => {
    const currentSchedule = Array.isArray(teacher?.schedule) ? teacher.schedule : [];
    const updatedSchedule = currentSchedule.filter((s) => s.id !== slotId);
    try {
      await updateTeacher({
        id: teacher.id,
        body: { schedule: updatedSchedule },
      }).unwrap();
      toast.success("Period removed from schedule");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove period");
    }
  };

  // ==========================================
  // SALARY & PAYROLL CRUD STATE
  // ==========================================
  const {
    data: salariesResponse,
    isLoading: isSalariesLoading,
  } = useGetTeacherSalariesQuery(id, { skip: !id });
  const salaryRecords = salariesResponse?.data || [];

  const [createSalary, { isLoading: isCreatingSalary }] = useCreateTeacherSalaryMutation();
  const [updateSalary, { isLoading: isUpdatingSalary }] = useUpdateTeacherSalaryMutation();
  const [deleteSalary, { isLoading: isDeletingSalary }] = useDeleteTeacherSalaryMutation();

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    month: "November",
    year: "2026",
    basicSalary: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    netAmount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    transactionRef: "",
    status: "Paid",
    remarks: "",
  });

  const handleOpenAddSalary = () => {
    setSelectedSalary(null);
    const configuredMonths = new Set(salaryRecords.map((s) => s.month?.toLowerCase()));
    const nextMonth =
      MONTHS_ORDER.find((m) => !configuredMonths.has(m.toLowerCase())) || "November";
    const basic = Number(teacher?.basicSalary ?? teacher?.salary ?? 0);
    const allow = Number(teacher?.allowances ?? 0);
    const ded = Number(teacher?.deductions ?? 0);
    setSalaryForm({
      month: nextMonth,
      year: "2026",
      basicSalary: basic,
      allowances: allow,
      bonus: 0,
      deductions: ded,
      netAmount: Math.max(0, basic + allow - ded),
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: teacher?.paymentMethod || "Bank Transfer",
      transactionRef: `TRX-${nextMonth.slice(0, 3).toUpperCase()}-2026`,
      status: "Paid",
      remarks: "Monthly salary disbursement",
    });
    setIsSalaryModalOpen(true);
  };

  const handleOpenEditSalary = (sal) => {
    setSelectedSalary(sal);
    setSalaryForm({
      month: sal.month || "November",
      year: sal.year || "2026",
      basicSalary: sal.basicSalary ?? 0,
      allowances: sal.allowances ?? 0,
      bonus: sal.bonus ?? 0,
      deductions: sal.deductions ?? 0,
      netAmount: sal.netAmount ?? sal.amount ?? 0,
      paymentDate: sal.paymentDate || new Date().toISOString().split("T")[0],
      paymentMethod: sal.paymentMethod || "Bank Transfer",
      transactionRef: sal.transactionRef || "",
      status: sal.status || "Paid",
      remarks: sal.remarks || "",
    });
    setIsSalaryModalOpen(true);
  };

  const handleSalaryCalcChange = (field, val) => {
    const next = { ...salaryForm, [field]: val };
    const b = Number(next.basicSalary || 0);
    const a = Number(next.allowances || 0);
    const bo = Number(next.bonus || 0);
    const d = Number(next.deductions || 0);
    next.netAmount = Math.max(0, b + a + bo - d);
    setSalaryForm(next);
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    try {
      if (selectedSalary) {
        await updateSalary({
          id: selectedSalary.id,
          teacherId: id,
          body: salaryForm,
        }).unwrap();
        toast.success(`Salary record for ${salaryForm.month} updated!`);
      } else {
        await createSalary({
          teacherId: id,
          ...salaryForm,
        }).unwrap();
        toast.success(`Salary record for ${salaryForm.month} created!`);
      }
      setIsSalaryModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save salary record");
    }
  };

  const handleQuickPaySalary = async (sal) => {
    try {
      await updateSalary({
        id: sal.id,
        teacherId: id,
        body: {
          status: "Paid",
          paymentDate: new Date().toISOString().split("T")[0],
          transactionRef: sal.transactionRef || `TRX-${sal.month?.slice(0, 3).toUpperCase()}-PAID`,
          remarks: "Disbursed and verified",
        },
      }).unwrap();
      toast.success(`Salary for ${sal.month} marked as Paid!`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update payment status");
    }
  };

  const handleDeleteSalaryRecord = async (sal) => {
    try {
      await deleteSalary({ id: sal.id, teacherId: id }).unwrap();
      toast.success(`Salary record for ${sal.month} deleted`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete salary record");
    }
  };

  // ==========================================
  // LEAVES & ATTENDANCE CRUD STATE
  // ==========================================
  const { data: leavesResponse } = useGetTeacherLeavesQuery({ teacherId: id }, { skip: !id });
  const leavesList = leavesResponse?.data || [];

  const [createLeave, { isLoading: isCreatingLeave }] = useCreateTeacherLeaveMutation();
  const [updateLeave] = useUpdateTeacherLeaveMutation();
  const [deleteLeave] = useDeleteTeacherLeaveMutation();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual Leave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    days: 1,
    reason: "",
    status: "Approved",
    approvedBy: "Principal",
    remarks: "",
  });

  const handleSaveLeave = async (e) => {
    e.preventDefault();
    try {
      await createLeave({
        teacherId: id,
        ...leaveForm,
      }).unwrap();
      toast.success("Leave application recorded!");
      setIsLeaveModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to record leave");
    }
  };

  const handleLeaveStatus = async (leaveId, status) => {
    try {
      await updateLeave({ id: leaveId, body: { status } }).unwrap();
      toast.success(`Leave marked as ${status}`);
    } catch (err) {
      toast.error("Failed to update leave status");
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      await deleteLeave(leaveId).unwrap();
      toast.success("Leave record deleted");
    } catch (err) {
      toast.error("Failed to delete leave");
    }
  };

  const { data: attendanceResponse } = useGetTeacherAttendanceQuery(
    { teacherId: id },
    { skip: !id }
  );
  const attendanceList = attendanceResponse?.data || [];
  const [saveAttendance, { isLoading: isSavingAtt }] = useSaveTeacherAttendanceMutation();
  const [attForm, setAttForm] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "Present",
    checkIn: "07:55 AM",
    checkOut: "02:00 PM",
    remarks: "",
  });

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    try {
      await saveAttendance({
        teacherId: id,
        ...attForm,
      }).unwrap();
      toast.success(`Attendance logged for ${attForm.date}`);
    } catch (err) {
      toast.error("Failed to log attendance");
    }
  };

  const totalDisbursed = salaryRecords
    .filter((s) => String(s.status || "").toLowerCase() === "paid")
    .reduce((sum, s) => sum + Number(s.netAmount || s.amount || 0), 0);
  const totalPendingSalary = salaryRecords
    .filter((s) => String(s.status || "").toLowerCase() === "pending")
    .reduce((sum, s) => sum + Number(s.netAmount || s.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading faculty profile...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/teachers")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Faculty Directory
        </Button>
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive shadow-card">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold text-lg">Teacher Profile Not Found</p>
            <p className="text-sm opacity-90">
              {error?.data?.message || "We couldn't retrieve details for this faculty member."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/teachers")}
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Faculty Directory
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              downloadTeacherProfilePDF(teacher);
              toast.success("Teacher profile dossier PDF downloaded!");
            }}
            className="gap-2 font-semibold"
          >
            <Download className="h-4 w-4 text-primary" /> Profile Dossier PDF
          </Button>
          <Button
            onClick={() => setIsEditProfileOpen(true)}
            className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
          >
            <Pencil className="h-4 w-4" /> Edit Faculty Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-2 font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete Teacher
          </Button>
        </div>
      </div>

      {/* Header Profile Banner */}
      <Card className="shadow-card border-none bg-gradient-to-r from-muted/50 to-muted/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-glow">
            <AvatarImage src={getMediaUrl(teacher.photo)} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-3xl font-extrabold">
              {getInitials(teacher.fullName || teacher.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black tracking-tight">
                {teacher.fullName || teacher.name}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                {teacher.employeeId || `EMP-${teacher.id}`}
              </Badge>
              <StatusBadge status={teacher.status || "Active"} />
              <StatusBadge status={teacher.salaryStatus || "Paid"} />
              {teacher.classTeacherOf && (
                <Badge className="gradient-primary text-primary-foreground border-0">
                  Class Teacher: {teacher.classTeacherOf}
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-primary flex items-center justify-center md:justify-start gap-1.5">
              <Award className="h-4 w-4 text-primary" /> {teacher.designation || "Senior Teacher"} —{" "}
              {teacher.department || "Academics"} Department ({teacher.subject})
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground font-medium">
              <p>
                Qualification:{" "}
                <span className="text-foreground font-semibold">
                  {teacher.qualification || "—"}
                </span>
              </p>
              <p>
                Experience:{" "}
                <span className="text-foreground font-semibold">{teacher.experience || 0} yrs</span>
              </p>
              <p>
                Phone: <span className="text-foreground font-semibold">{teacher.phone}</span>
              </p>
              <p>
                Monthly Package:{" "}
                <span className="text-primary font-bold">
                  PKR {Number(teacher.salary || 0).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Operations Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:max-w-2xl bg-muted rounded-xl p-1 mb-6">
          <TabsTrigger value="profile" className="rounded-lg py-2 text-xs font-semibold">
            Profile & Docs
          </TabsTrigger>
          <TabsTrigger value="timetable" className="rounded-lg py-2 text-xs font-semibold">
            Classes & Timetable
          </TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-lg py-2 text-xs font-semibold">
            Salary & Payroll
          </TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-lg py-2 text-xs font-semibold">
            Attendance & Leaves
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: PROFILE & DOCUMENTS                 */}
        {/* ========================================== */}
        <TabsContent value="profile" className="space-y-6 animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal & Identity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Employee ID" value={teacher.employeeId} />
                <DetailRow label="Full Name" value={teacher.fullName || teacher.name} />
                <DetailRow label="Father / Spouse Name" value={teacher.fatherOrSpouseName} />
                <DetailRow label="CNIC Number" value={teacher.cnic} />
                <DetailRow label="Date of Birth" value={teacher.dob} />
                <DetailRow label="Gender" value={teacher.gender} />
                <DetailRow label="Blood Group" value={teacher.bloodGroup} />
                <DetailRow label="Marital Status" value={teacher.maritalStatus} />
                <DetailRow label="Religion" value={teacher.religion} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Contact & Residential Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Primary Mobile" value={teacher.phone} />
                <DetailRow
                  label="Emergency / Alt Contact"
                  value={teacher.emergencyContact || teacher.altPhone}
                />
                <DetailRow label="Official Email" value={teacher.email} />
                <DetailRow label="City" value={teacher.city} />
                <DetailRow label="Residential Address" value={teacher.address} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Academic & Professional Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Department" value={teacher.department} />
                <DetailRow label="Designation" value={teacher.designation} />
                <DetailRow label="Primary Subject" value={teacher.subject} />
                <DetailRow
                  label="Allied Subjects"
                  value={(teacher.secondarySubjects || []).join(", ")}
                />
                <DetailRow label="Qualification" value={teacher.qualification} />
                <DetailRow label="Specialization" value={teacher.specialization} />
                <DetailRow label="University / Institution" value={teacher.university} />
                <DetailRow label="Experience" value={`${teacher.experience || 0} Years`} />
                <DetailRow label="Previous Institution" value={teacher.previousInstitution} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> Employment & Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Joining Date" value={teacher.joiningDate} />
                <DetailRow label="Employment Type" value={teacher.employmentType || teacher.type} />
                <DetailRow
                  label="Basic Salary"
                  value={`PKR ${Number(teacher.basicSalary || teacher.salary || 0).toLocaleString()}`}
                />
                <DetailRow
                  label="Allowances"
                  value={`PKR ${Number(teacher.allowances || 0).toLocaleString()}`}
                />
                <DetailRow
                  label="Deductions"
                  value={`PKR ${Number(teacher.deductions || 0).toLocaleString()}`}
                />
                <DetailRow
                  label="Net Monthly Salary"
                  value={`PKR ${Number(teacher.salary || 0).toLocaleString()}`}
                />
                <DetailRow label="Payment Mode" value={teacher.paymentMethod} />
                <DetailRow label="Bank Name" value={teacher.bankName} />
                <DetailRow label="Account No / IBAN" value={teacher.bankAccountNo || teacher.iban} />
                <DetailRow label="HR Remarks" value={teacher.remarks} />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Uploaded Faculty Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <DocumentBlock label="Profile Photo" path={teacher.photo} />
              <DocumentBlock label="CV / Resume" path={teacher.resumeCv} />
              <DocumentBlock label="CNIC Copy" path={teacher.cnicCopy} />
              <DocumentBlock label="Degree Certificate" path={teacher.degreeCertificate} />
              <DocumentBlock label="Experience Letter" path={teacher.experienceLetter} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: CLASSES, TIMETABLE & STUDENTS       */}
        {/* ========================================== */}
        <TabsContent value="timetable" className="space-y-6 animate-fade-in-up">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="shadow-card lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Assigned Classes & Workload
                </CardTitle>
                <CardDescription>
                  Academic classes and subjects taught by {teacher.fullName || teacher.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Assigned Classes ({teacher.classes?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(teacher.classes || []).length > 0 ? (
                      teacher.classes.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => navigate(`/students?class=${encodeURIComponent(c)}`)}
                        >
                          Class {c}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No classes assigned yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <DetailRow label="Class Teacher Of" value={teacher.classTeacherOf || "None"} />
                  <DetailRow
                    label="Weekly Workload"
                    value={`${teacher.weeklyWorkload || 24} Periods / Week`}
                  />
                  <DetailRow
                    label="Scheduled Periods"
                    value={`${(teacher.schedule || []).length} Active Slots`}
                  />
                  <DetailRow
                    label="Total Students Taught"
                    value={`${teacherStudents.length} Students`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Weekly Teaching Timetable
                  </CardTitle>
                  <CardDescription>
                    Manage period slots, rooms, and class assignments
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleOpenAddPeriod}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0"
                >
                  <Plus className="h-4 w-4" /> Add Period Slot
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left text-xs uppercase font-bold text-muted-foreground border-b">
                        <th className="p-3">Day</th>
                        <th className="p-3">Period & Time</th>
                        <th className="p-3">Class & Section</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Room</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(teacher.schedule || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                            No timetable periods assigned yet. Click "Add Period Slot" to schedule classes.
                          </td>
                        </tr>
                      ) : (
                        (teacher.schedule || []).map((slot) => (
                          <tr key={slot.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="p-3 font-semibold">{slot.day}</td>
                            <td className="p-3">
                              <p className="font-medium text-xs">{slot.period}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {slot.startTime} - {slot.endTime}
                              </p>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="font-semibold">
                                Class {slot.className}-{slot.section}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium text-primary">{slot.subject}</td>
                            <td className="p-3 text-xs text-muted-foreground">{slot.room}</td>
                            <td className="p-3 text-right">
                              <div className="inline-flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEditPeriod(slot)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeletePeriod(slot.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students in Assigned Classes */}
          <Card className="shadow-card">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Students in Assigned Classes (
                {teacherStudents.length})
              </CardTitle>
              <CardDescription>
                Students enrolled in Classes {(teacher.classes || []).join(", ") || "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {teacherStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No students enrolled in this teacher's assigned classes yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 text-left text-xs uppercase font-bold text-muted-foreground border-b">
                        <th className="p-3">Student</th>
                        <th className="p-3">Roll No</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Father's Name</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3 text-right">Profile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherStudents.slice(0, 15).map((s) => (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-3 font-medium">{s.fullName || s.name}</td>
                          <td className="p-3 font-mono text-xs">#{s.rollNo}</td>
                          <td className="p-3 font-semibold">
                            Class {s.class}-{s.section}
                          </td>
                          <td className="p-3 text-muted-foreground">{s.fatherName}</td>
                          <td className="p-3 text-xs">{s.mobile}</td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/students/details/${s.id}`)}
                              className="gap-1 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
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
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: SALARY & PAYROLL LEDGER             */}
        {/* ========================================== */}
        <TabsContent value="payroll" className="space-y-6 animate-fade-in-up">
          <Card className="shadow-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> Faculty Payroll & Compensation Ledger
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Manage monthly salary disbursements, bonuses, deductions, and official salary slips.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={salaryRecords.length === 0}
                  onClick={() => {
                    downloadTeacherSalaryStatementPDF(teacher, salaryRecords);
                    toast.success("Annual salary statement PDF downloaded!");
                  }}
                  className="gap-1.5 font-semibold"
                >
                  <Download className="h-4 w-4 text-primary" /> Statement PDF
                </Button>
                <Button
                  size="sm"
                  onClick={handleOpenAddSalary}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-glow"
                >
                  <Plus className="h-4 w-4" /> Add Month Salary
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Monthly Net Package
                  </p>
                  <p className="text-xl font-bold mt-1 text-primary">
                    PKR {Number(teacher.salary || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Basic: PKR {Number(teacher.basicSalary || teacher.salary || 0).toLocaleString()} ·
                    Allow: PKR {Number(teacher.allowances || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Total Disbursed (Paid)
                  </p>
                  <p className="text-xl font-bold mt-1 text-success">
                    PKR {totalDisbursed.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Pending Salary Dues
                  </p>
                  <p
                    className={`text-xl font-bold mt-1 ${
                      totalPendingSalary > 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    PKR {totalPendingSalary.toLocaleString()}
                  </p>
                </div>
              </div>

              {isSalariesLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted text-muted-foreground text-left text-xs uppercase font-bold border-b">
                        <th className="p-3">Month</th>
                        <th className="p-3">Basic</th>
                        <th className="p-3">Allowances</th>
                        <th className="p-3">Bonus</th>
                        <th className="p-3">Deductions</th>
                        <th className="p-3">Net Payable</th>
                        <th className="p-3">Payment Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryRecords.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-muted-foreground text-xs">
                            No salary records configured yet. Click "Add Month Salary" to create one.
                          </td>
                        </tr>
                      ) : (
                        salaryRecords.map((sal) => (
                          <tr key={sal.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="p-3 font-semibold">
                              {sal.month} {sal.year}
                            </td>
                            <td className="p-3">PKR {Number(sal.basicSalary || 0).toLocaleString()}</td>
                            <td className="p-3 text-xs">
                              +PKR {Number(sal.allowances || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-xs text-success">
                              +PKR {Number(sal.bonus || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-xs text-destructive">
                              -PKR {Number(sal.deductions || 0).toLocaleString()}
                            </td>
                            <td className="p-3 font-bold text-primary">
                              PKR {Number(sal.netAmount || sal.amount || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {sal.paymentDate || "—"}
                            </td>
                            <td className="p-3">
                              <StatusBadge status={sal.status || "Paid"} />
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs gap-1 font-semibold text-primary"
                                  onClick={() => {
                                    downloadTeacherSalarySlipPDF(sal, teacher);
                                    toast.success(`Salary slip PDF downloaded for ${sal.month}`);
                                  }}
                                >
                                  <Download className="h-3 w-3" /> Slip
                                </Button>
                                {String(sal.status || "").toLowerCase() === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs gap-1 text-success border-success/40 hover:bg-success/10"
                                    onClick={() => handleQuickPaySalary(sal)}
                                  >
                                    <CreditCard className="h-3 w-3" /> Pay
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEditSalary(sal)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteSalaryRecord(sal)}
                                  disabled={isDeletingSalary}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 4: ATTENDANCE & LEAVES                 */}
        {/* ========================================== */}
        <TabsContent value="leaves" className="space-y-6 animate-fade-in-up">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Log Attendance Card */}
            <Card className="shadow-card lg:col-span-1">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" /> Mark Daily Attendance
                </CardTitle>
                <CardDescription>Record check-in/out for this teacher</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleLogAttendance} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={attForm.date}
                      onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <select
                      value={attForm.status}
                      onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Check-In</Label>
                      <Input
                        value={attForm.checkIn}
                        onChange={(e) => setAttForm({ ...attForm, checkIn: e.target.value })}
                        placeholder="07:55 AM"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Check-Out</Label>
                      <Input
                        value={attForm.checkOut}
                        onChange={(e) => setAttForm({ ...attForm, checkOut: e.target.value })}
                        placeholder="02:00 PM"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Remarks</Label>
                    <Input
                      value={attForm.remarks}
                      onChange={(e) => setAttForm({ ...attForm, remarks: e.target.value })}
                      placeholder="On time / Substitution"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSavingAtt}
                    className="w-full gradient-primary text-primary-foreground border-0"
                  >
                    {isSavingAtt && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save Attendance Log
                  </Button>
                </form>

                {/* Recent Attendance History */}
                <div className="mt-6 pt-4 border-t space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Recent Attendance Logs
                  </p>
                  {attendanceList.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-semibold">{a.date}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.checkIn} - {a.checkOut}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leave Requests & History */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <div>
                  <CardTitle className="text-base font-bold">
                    Faculty Leave Applications & History
                  </CardTitle>
                  <CardDescription>
                    Record and approve sick, casual, or official duty leaves
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0"
                >
                  <Plus className="h-4 w-4" /> Record Leave
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 text-left text-xs uppercase font-bold text-muted-foreground border-b">
                        <th className="p-3">Leave Type</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Days</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leavesList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                            No leave applications recorded for this teacher.
                          </td>
                        </tr>
                      ) : (
                        leavesList.map((lv) => (
                          <tr key={lv.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="p-3 font-semibold">{lv.leaveType}</td>
                            <td className="p-3 text-xs">
                              {lv.startDate} to {lv.endDate}
                            </td>
                            <td className="p-3 font-bold">{lv.days}d</td>
                            <td className="p-3 text-xs text-muted-foreground max-w-xs">
                              {lv.reason || "—"}
                            </td>
                            <td className="p-3">
                              <StatusBadge status={lv.status} />
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                {lv.status !== "Approved" && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-success"
                                    title="Approve Leave"
                                    onClick={() => handleLeaveStatus(lv.id, "Approved")}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {lv.status !== "Rejected" && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-warning"
                                    title="Reject Leave"
                                    onClick={() => handleLeaveStatus(lv.id, "Rejected")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteLeave(lv.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Teacher Profile Modal */}
      <TeacherFormDialog
        open={isEditProfileOpen}
        setOpen={setIsEditProfileOpen}
        teacher={teacher}
      />

      {/* Add / Edit Period Slot Modal */}
      <Dialog open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPeriodId ? "Edit Timetable Slot" : "Add Timetable Period"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePeriod} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Day of Week</Label>
                <select
                  value={periodForm.day}
                  onChange={(e) => setPeriodForm({ ...periodForm, day: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Period Label</Label>
                <select
                  value={periodForm.period}
                  onChange={(e) => setPeriodForm({ ...periodForm, period: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {[
                    "1st Period",
                    "2nd Period",
                    "3rd Period",
                    "4th Period",
                    "5th Period",
                    "6th Period",
                    "7th Period",
                  ].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={periodForm.startTime}
                  onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={periodForm.endTime}
                  onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <select
                  value={periodForm.className}
                  onChange={(e) => setPeriodForm({ ...periodForm, className: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(classesList.length > 0
                    ? classesList.map((c) => c.name)
                    : ["Nursery", "KG", "5", "6", "7", "8", "9", "10"]
                  ).map((cn) => (
                    <option key={cn} value={cn}>
                      Class {cn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <select
                  value={periodForm.section}
                  onChange={(e) => setPeriodForm({ ...periodForm, section: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {["A", "B", "C", "D"].map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input
                  value={periodForm.subject}
                  onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Room / Lab</Label>
                <Input
                  value={periodForm.room}
                  onChange={(e) => setPeriodForm({ ...periodForm, room: e.target.value })}
                  placeholder="Room 201"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPeriodOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingTeacher}
                className="gradient-primary text-primary-foreground border-0"
              >
                Save Period
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Salary Record Modal */}
      <Dialog open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSalary ? `Edit ${selectedSalary.month} Salary` : "Configure Monthly Salary"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSalary} className="space-y-4 py-2">
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
                <Label>Year</Label>
                <Input
                  value={salaryForm.year}
                  onChange={(e) => setSalaryForm({ ...salaryForm, year: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Basic Salary (PKR)</Label>
                <Input
                  type="number"
                  value={salaryForm.basicSalary}
                  onChange={(e) => handleSalaryCalcChange("basicSalary", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Allowances (PKR)</Label>
                <Input
                  type="number"
                  value={salaryForm.allowances}
                  onChange={(e) => handleSalaryCalcChange("allowances", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bonus / Extra Duty (PKR)</Label>
                <Input
                  type="number"
                  value={salaryForm.bonus}
                  onChange={(e) => handleSalaryCalcChange("bonus", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Deductions (PKR)</Label>
                <Input
                  type="number"
                  value={salaryForm.deductions}
                  onChange={(e) => handleSalaryCalcChange("deductions", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Net Payable (PKR)</Label>
                <Input
                  type="number"
                  value={salaryForm.netAmount}
                  onChange={(e) => setSalaryForm({ ...salaryForm, netAmount: e.target.value })}
                  className="font-bold text-primary"
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
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <select
                  value={salaryForm.paymentMethod}
                  onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Remarks / Transaction Reference</Label>
                <Input
                  value={salaryForm.remarks}
                  onChange={(e) => setSalaryForm({ ...salaryForm, remarks: e.target.value })}
                  placeholder="e.g. Disbursed via HBL corporate transfer"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSalaryModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingSalary || isUpdatingSalary}
                className="gradient-primary text-primary-foreground border-0"
              >
                {(isCreatingSalary || isUpdatingSalary) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save Salary Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Leave Modal */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Faculty Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLeave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
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
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  required
                />
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
                <Label>Approval Status</Label>
                <select
                  value={leaveForm.status}
                  onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Reason</Label>
                <Textarea
                  rows={2}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Reason for leave request..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLeaveModalOpen(false)}>
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

      {/* Delete Teacher Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Faculty Profile?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to permanently delete{" "}
            <strong className="text-foreground">{teacher.fullName || teacher.name}</strong> and all
            associated payroll, attendance, and leave records?
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeletingTeacher}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingTeacher}
              onClick={handleDeleteTeacherConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingTeacher && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between py-2 border-b last:border-0 text-sm">
      <span className="text-muted-foreground font-semibold">{label}</span>
      <span className="font-medium text-foreground text-right mt-1 sm:mt-0 break-words max-w-xs">
        {value !== undefined && value !== null && value !== "" ? String(value) : "—"}
      </span>
    </div>
  );
}

function DocumentBlock({ label, path }) {
  if (!path) {
    return (
      <div className="p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center bg-muted/20">
        <FileText className="h-8 w-8 text-muted-foreground/30 mb-1" />
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/60 mt-1">Not Uploaded</span>
      </div>
    );
  }

  const mediaUrl = getMediaUrl(path);

  return (
    <div className="p-4 rounded-xl border flex flex-col items-center justify-center text-center bg-muted/10 group hover:border-primary/30 transition-smooth">
      <FileText className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-smooth" />
      <span className="text-xs font-bold truncate max-w-full block mb-2">{label}</span>
      <a
        href={mediaUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-primary hover:underline"
      >
        <Download className="h-3 w-3" /> View / Download
      </a>
    </div>
  );
}

