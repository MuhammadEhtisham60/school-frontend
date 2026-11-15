import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useGetNextEmployeeIdQuery,
} from "@/services/private/teacherService";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import {
  User,
  GraduationCap,
  Layers,
  Wallet,
  FileText,
  Plus,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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

const DESIGNATIONS = [
  "Head of Department",
  "Senior Subject Specialist",
  "Senior Teacher",
  "Subject Specialist",
  "Junior Teacher",
  "Primary Coordinator",
  "Montessori Directress",
  "IT & Lab Instructor",
  "Sports Coach",
];

const DEFAULT_FORM = {
  employeeId: "",
  fullName: "",
  fatherOrSpouseName: "",
  dob: "1990-01-15",
  gender: "Male",
  cnic: "",
  bloodGroup: "O+",
  maritalStatus: "Married",
  religion: "Islam",
  photoUrl: "",
  phone: "",
  altPhone: "",
  email: "",
  emergencyContact: "",
  city: "Lahore",
  address: "",
  designation: "Senior Teacher",
  department: "Science",
  subject: "",
  secondarySubjects: [],
  qualification: "",
  specialization: "",
  university: "",
  passingYear: "2018",
  experience: 5,
  previousInstitution: "",
  joiningDate: new Date().toISOString().split("T")[0],
  employmentType: "Full-time",
  status: "Active",
  classes: [],
  assignedSections: ["A", "B"],
  classTeacherOf: "",
  weeklyWorkload: 24,
  basicSalary: 65000,
  allowances: 8000,
  deductions: 3000,
  salary: 70000,
  bankName: "Meezan Bank",
  bankAccountNo: "",
  iban: "",
  paymentMethod: "Bank Transfer",
  remarks: "",
};

export function TeacherFormDialog({ open, setOpen, teacher = null, onSuccess }) {
  const isEdit = !!teacher;
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [secSubInput, setSecSubInput] = useState("");
  const [files, setFiles] = useState({
    photo: null,
    resumeCv: null,
    cnicCopy: null,
    degreeCertificate: null,
    experienceLetter: null,
  });

  const { data: nextIdData } = useGetNextEmployeeIdQuery(undefined, {
    skip: !open || isEdit,
  });
  const { data: classesResponse } = useGetClassesDropdownQuery();
  const classesList = classesResponse?.data || [];

  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    setActiveTab("personal");
    setFiles({
      photo: null,
      resumeCv: null,
      cnicCopy: null,
      degreeCertificate: null,
      experienceLetter: null,
    });
    if (teacher) {
      setForm({
        employeeId: teacher.employeeId || "",
        fullName: teacher.fullName || teacher.name || "",
        fatherOrSpouseName: teacher.fatherOrSpouseName || "",
        dob: teacher.dob || "1990-01-15",
        gender: teacher.gender || "Male",
        cnic: teacher.cnic || "",
        bloodGroup: teacher.bloodGroup || "O+",
        maritalStatus: teacher.maritalStatus || "Married",
        religion: teacher.religion || "Islam",
        photoUrl: teacher.photo || "",
        phone: teacher.phone || "",
        altPhone: teacher.altPhone || "",
        email: teacher.email || "",
        emergencyContact: teacher.emergencyContact || "",
        city: teacher.city || "Lahore",
        address: teacher.address || "",
        designation: teacher.designation || "Senior Teacher",
        department: teacher.department || "Science",
        subject: teacher.subject || "",
        secondarySubjects: Array.isArray(teacher.secondarySubjects)
          ? teacher.secondarySubjects
          : [],
        qualification: teacher.qualification || "",
        specialization: teacher.specialization || "",
        university: teacher.university || "",
        passingYear: teacher.passingYear || "",
        experience: teacher.experience ?? 5,
        previousInstitution: teacher.previousInstitution || "",
        joiningDate: teacher.joiningDate || new Date().toISOString().split("T")[0],
        employmentType: teacher.employmentType || teacher.type || "Full-time",
        status: teacher.status || "Active",
        classes: Array.isArray(teacher.classes) ? teacher.classes : [],
        assignedSections: Array.isArray(teacher.assignedSections)
          ? teacher.assignedSections
          : ["A", "B"],
        classTeacherOf: teacher.classTeacherOf || "",
        weeklyWorkload: teacher.weeklyWorkload ?? 24,
        basicSalary: teacher.basicSalary ?? teacher.salary ?? 65000,
        allowances: teacher.allowances ?? 0,
        deductions: teacher.deductions ?? 0,
        salary: teacher.salary ?? 65000,
        bankName: teacher.bankName || "",
        bankAccountNo: teacher.bankAccountNo || "",
        iban: teacher.iban || "",
        paymentMethod: teacher.paymentMethod || "Bank Transfer",
        remarks: teacher.remarks || "",
      });
    } else {
      setForm({
        ...DEFAULT_FORM,
        employeeId: nextIdData?.employeeId || "EMP-107",
      });
    }
  }, [open, teacher, isEdit, nextIdData?.employeeId]);

  const handleSalaryPartChange = (field, val) => {
    const next = { ...form, [field]: val };
    const b = Number(next.basicSalary || 0);
    const a = Number(next.allowances || 0);
    const d = Number(next.deductions || 0);
    next.salary = Math.max(0, b + a - d);
    setForm(next);
  };

  const toggleClass = (className) => {
    const exists = form.classes.includes(className);
    const updated = exists
      ? form.classes.filter((c) => c !== className)
      : [...form.classes, className];
    setForm({ ...form, classes: updated });
  };

  const handleAddSecondarySubject = () => {
    const val = secSubInput.trim();
    if (val && !form.secondarySubjects.includes(val)) {
      setForm({ ...form, secondarySubjects: [...form.secondarySubjects, val] });
      setSecSubInput("");
    }
  };

  const handleRemoveSecondarySubject = (sub) => {
    setForm({
      ...form,
      secondarySubjects: form.secondarySubjects.filter((s) => s !== sub),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Teacher full name is required");
      setActiveTab("personal");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      setActiveTab("personal");
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Primary teaching subject is required");
      setActiveTab("academic");
      return;
    }

    const hasUploadedFiles = Object.values(files).some((f) => f instanceof File);

    try {
      let payload;
      if (hasUploadedFiles) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            fd.append(k, JSON.stringify(v));
          } else if (v !== null && v !== undefined) {
            fd.append(k, v);
          }
        });
        Object.entries(files).forEach(([k, file]) => {
          if (file instanceof File) {
            fd.append(k, file);
          }
        });
        payload = fd;
      } else {
        payload = {
          ...form,
          experience: Number(form.experience || 0),
          weeklyWorkload: Number(form.weeklyWorkload || 24),
          basicSalary: Number(form.basicSalary || 0),
          allowances: Number(form.allowances || 0),
          deductions: Number(form.deductions || 0),
          salary: Number(form.salary || 0),
        };
      }

      if (isEdit) {
        await updateTeacher({ id: teacher.id, body: payload }).unwrap();
        toast.success(`${form.fullName} updated successfully!`);
      } else {
        await createTeacher(payload).unwrap();
        toast.success(`${form.fullName} added to faculty directory!`);
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save teacher record");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {isEdit
              ? `Edit Faculty Profile — ${teacher.fullName || teacher.name}`
              : "Onboard New Faculty / Teacher"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-muted rounded-xl p-1">
              <TabsTrigger value="personal" className="text-xs font-semibold gap-1">
                <User className="h-3.5 w-3.5 hidden sm:inline" /> Personal
              </TabsTrigger>
              <TabsTrigger value="academic" className="text-xs font-semibold gap-1">
                <GraduationCap className="h-3.5 w-3.5 hidden sm:inline" /> Academic
              </TabsTrigger>
              <TabsTrigger value="classes" className="text-xs font-semibold gap-1">
                <Layers className="h-3.5 w-3.5 hidden sm:inline" /> Classes
              </TabsTrigger>
              <TabsTrigger value="payroll" className="text-xs font-semibold gap-1">
                <Wallet className="h-3.5 w-3.5 hidden sm:inline" /> Payroll
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs font-semibold gap-1">
                <FileText className="h-3.5 w-3.5 hidden sm:inline" /> Docs
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: PERSONAL & CONTACT */}
            <TabsContent value="personal" className="space-y-4 pt-3">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Employee ID</Label>
                  <Input
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    placeholder="EMP-107"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Dr. Sara Mahmood"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Father / Spouse Name</Label>
                  <Input
                    value={form.fatherOrSpouseName}
                    onChange={(e) => setForm({ ...form, fatherOrSpouseName: e.target.value })}
                    placeholder="e.g. Mahmood Ul Hassan"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CNIC Number</Label>
                  <Input
                    value={form.cnic}
                    onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                    placeholder="35202-1234567-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Blood Group</Label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Marital Status</Label>
                  <select
                    value={form.maritalStatus}
                    onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Mobile / Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0321-1234567"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Emergency / Alt Contact</Label>
                  <Input
                    value={form.emergencyContact}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        emergencyContact: e.target.value,
                        altPhone: e.target.value,
                      })
                    }
                    placeholder="0300-9876543"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Official Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="teacher@school.pk"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Lahore"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Residential Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="House, Street, Sector / Town, City"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ACADEMIC & PROFESSIONAL */}
            <TabsContent value="academic" className="space-y-4 pt-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Department *</Label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Designation *</Label>
                  <select
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Subject *</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Mathematics, Physics, English"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Highest Qualification *</Label>
                  <Input
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="e.g. MPhil Physics, MSc Mathematics, B.Ed"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Specialization</Label>
                  <Input
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Applied Calculus, Literature"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>University / Board</Label>
                  <Input
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    placeholder="e.g. University of the Punjab"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Teaching Experience (Years)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Previous Institution</Label>
                  <Input
                    value={form.previousInstitution}
                    onChange={(e) => setForm({ ...form, previousInstitution: e.target.value })}
                    placeholder="e.g. Beaconhouse School System"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 pt-2 border-t">
                  <Label>Secondary / Allied Subjects</Label>
                  <div className="flex gap-2">
                    <Input
                      value={secSubInput}
                      onChange={(e) => setSecSubInput(e.target.value)}
                      placeholder="Add allied subject (e.g. Statistics, General Science)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSecondarySubject();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSecondarySubject}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.secondarySubjects.map((sub, i) => (
                      <Badge key={i} variant="secondary" className="gap-1.5 px-2.5 py-1">
                        {sub}
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondarySubject(sub)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: CLASSES & EMPLOYMENT */}
            <TabsContent value="classes" className="space-y-4 pt-3">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Joining Date</Label>
                  <Input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Employment Type</Label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Visiting">Visiting Faculty</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Employment Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Class Teacher In-Charge Of</Label>
                  <Input
                    value={form.classTeacherOf}
                    onChange={(e) => setForm({ ...form, classTeacherOf: e.target.value })}
                    placeholder="e.g. 10-A, 9-B (Optional)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Weekly Workload (Periods/Week)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="48"
                    value={form.weeklyWorkload}
                    onChange={(e) => setForm({ ...form, weeklyWorkload: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <Label>Assign Academic Classes (Click to toggle)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(classesList.length > 0
                    ? classesList.map((c) => c.name)
                    : ["Nursery", "KG", "5", "6", "7", "8", "9", "10"]
                  ).map((clsName) => {
                    const selected = form.classes.includes(clsName);
                    return (
                      <button
                        key={clsName}
                        type="button"
                        onClick={() => toggleClass(clsName)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selected
                            ? "gradient-primary text-primary-foreground border-transparent shadow-sm"
                            : "bg-muted/40 text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                        Class {clsName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: SALARY & BANK PAYROLL */}
            <TabsContent value="payroll" className="space-y-4 pt-3">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Basic Monthly Salary (Rs.)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.basicSalary}
                    onChange={(e) => handleSalaryPartChange("basicSalary", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Allowances (HRA / Medical / Travel)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.allowances}
                    onChange={(e) => handleSalaryPartChange("allowances", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Monthly Deductions (Tax / PF)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.deductions}
                    onChange={(e) => handleSalaryPartChange("deductions", e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-primary">
                    Computed Net Monthly Salary
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Basic + Allowances − Deductions
                  </p>
                </div>
                <p className="text-2xl font-black text-primary">
                  Rs. {Number(form.salary || 0).toLocaleString()}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label>Salary Payment Mode</Label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Crossed Cheque</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Name</Label>
                  <Input
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="e.g. HBL, Meezan Bank, UBL"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Account Number</Label>
                  <Input
                    value={form.bankAccountNo}
                    onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })}
                    placeholder="0042-79012345-03"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>IBAN Number</Label>
                  <Input
                    value={form.iban}
                    onChange={(e) => setForm({ ...form, iban: e.target.value })}
                    placeholder="PK36HABB0000427901234503"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: DOCUMENTS & REMARKS */}
            <TabsContent value="documents" className="space-y-4 pt-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Profile Photo (Upload File)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, photo: e.target.files?.[0] || null })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Or Profile Photo URL</Label>
                  <Input
                    value={form.photoUrl}
                    onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CV / Resume (PDF/Doc)</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, resumeCv: e.target.files?.[0] || null })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CNIC Copy</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, cnicCopy: e.target.files?.[0] || null })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Degree / Transcript</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, degreeCertificate: e.target.files?.[0] || null })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Experience Certificate</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, experienceLetter: e.target.files?.[0] || null })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>HR Remarks / Responsibilities Note</Label>
                  <Textarea
                    rows={3}
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Special responsibilities, society patronage, lab charge, etc."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="gradient-primary text-primary-foreground border-0 font-semibold gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Save Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

