import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetStudentQuery,
} from "@/services/private/studentService";
import {
  useGetStudentFeesListQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} from "@/services/private/feeService";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/ListToolbar";
import {
  User,
  BookOpen,
  Phone,
  Users as UsersIcon,
  HeartPulse,
  Bus,
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
} from "lucide-react";
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
import { toast } from "sonner";

const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = import.meta.env.VITE_APP_API_URL
    ? import.meta.env.VITE_APP_API_URL.replace("/api/", "")
    : "http://localhost:5000";
  return `${baseUrl}${path}`;
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

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentQuery(id, { skip: !id });
  const student = data?.student;

  // Fee State Modals & Selection
  const [selectedFee, setSelectedFee] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for Add Month Fee
  const [addForm, setAddForm] = useState({
    month: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    status: "Paid",
    remarks: "",
  });

  // Form states for Edit Fee
  const [editForm, setEditForm] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "Cash",
    status: "Paid",
    remarks: "",
  });

  // Form states for Pay Fee
  const [payForm, setPayForm] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    remarks: "",
  });

  // API mutations & query
  const { data: feesData, isLoading: isFeesLoading, error: feesError } = useGetStudentFeesListQuery(id, { skip: !id });
  const [createFee, { isLoading: isCreatingFee }] = useCreateFeeMutation();
  const [updateFee, { isLoading: isUpdatingFee }] = useUpdateFeeMutation();
  const [deleteFee, { isLoading: isDeletingFee }] = useDeleteFeeMutation();

  const handleOpenEdit = (fee) => {
    setSelectedFee(fee);
    setEditForm({
      amount: fee.amount ?? 0,
      paymentDate: fee.paymentDate ?? new Date().toISOString().split("T")[0],
      paymentMethod: fee.paymentMethod ?? "Cash",
      status: fee.status ?? "Paid",
      remarks: fee.remarks ?? "",
    });
    setIsEditOpen(true);
  };

  const handleOpenPay = (fee) => {
    setSelectedFee(fee);
    setPayForm({
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      remarks: "",
    });
    setIsPayOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateFee({
        id: selectedFee.id,
        body: {
          amount: Number(editForm.amount),
          paymentDate: editForm.paymentDate,
          paymentMethod: editForm.paymentMethod,
          status: editForm.status,
          remarks: editForm.remarks,
        },
        studentId: id,
      }).unwrap();
      toast.success(`Fee details for ${selectedFee.month} updated successfully`);
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update monthly fee details");
    }
  };

  const handleSavePay = async (e) => {
    e.preventDefault();
    try {
      await updateFee({
        id: selectedFee.id,
        body: {
          amount: selectedFee.amount,
          paymentDate: payForm.paymentDate,
          paymentMethod: payForm.paymentMethod,
          status: "Paid",
          remarks: payForm.remarks,
        },
        studentId: id,
      }).unwrap();
      toast.success(`Payment recorded successfully for ${selectedFee.month}`);
      setIsPayOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to record fee payment");
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!addForm.month) {
      toast.error("Please select a month");
      return;
    }
    try {
      await createFee({
        studentId: id,
        month: addForm.month,
        amount: Number(addForm.amount),
        paymentDate: addForm.paymentDate,
        paymentMethod: addForm.paymentMethod,
        status: addForm.status,
        remarks: addForm.remarks,
      }).unwrap();
      toast.success(`Fee record created for ${addForm.month}`);
      setIsAddOpen(false);
      setAddForm({
        month: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        status: "Paid",
        remarks: "",
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add monthly fee");
    }
  };

  const handleDeleteFee = async (feeId, monthName) => {
    if (!window.confirm(`Are you sure you want to delete the fee record for ${monthName}?`)) {
      return;
    }
    try {
      await deleteFee({ id: feeId, studentId: id }).unwrap();
      toast.success(`Fee record for ${monthName} deleted successfully`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete fee record");
    }
  };

  const feeRecords = feesData?.data || [];
  const totalBilled = feeRecords.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const totalPaid = feeRecords.reduce((acc, f) => acc + (f.status?.toLowerCase() === "paid" ? (Number(f.amount) || 0) : 0), 0);
  const totalDue = feeRecords.reduce((acc, f) => acc + (f.status?.toLowerCase() === "pending" ? (Number(f.amount) || 0) : 0), 0);

  const MONTHS_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const configuredMonths = new Set(feeRecords.map((f) => f.month.trim().toLowerCase()));
  const availableMonths = MONTHS_ORDER.filter((m) => !configuredMonths.has(m.toLowerCase()));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/students")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive shadow-card">
          <AlertCircle className="h-5 w-5 animate-pulse" />
          <div>
            <p className="font-semibold text-lg">Student Profile Not Found</p>
            <p className="text-sm opacity-90">
              {error?.data?.message || "We couldn't retrieve details for this student. Verify the ID."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/students")} className="gap-2 self-start">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>
        <Button
          onClick={() => navigate(`/admission/${student.id}`)}
          className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow self-start"
        >
          <Pencil className="h-4 w-4" /> Edit Profile
        </Button>
      </div>

      {/* Header Profile Summary */}
      <Card className="shadow-card border-none bg-gradient-to-r from-muted/50 to-muted/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-glow">
            <AvatarImage src={getMediaUrl(student.photo)} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-3xl font-extrabold">
              {getInitials(student.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black tracking-tight">{student.fullName}</h1>
              <StatusBadge status={student.status || "Active"} />
              <StatusBadge status={student.feeStatus || "Paid"} />
            </div>
            <p className="text-sm font-semibold text-primary flex items-center justify-center md:justify-start gap-1">
              <GraduationCap className="h-4 w-4 text-primary" /> Class {student.class} — Section {student.section}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground font-medium">
              <p>Roll No: <span className="font-mono text-foreground font-bold">#{student.rollNo || "N/A"}</span></p>
              <p>DOB: <span className="text-foreground">{student.dob}</span></p>
              <p>Contact: <span className="text-foreground">{student.mobile}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:max-w-xl bg-muted rounded-xl p-1 mb-6">
          <TabsTrigger value="basic" className="rounded-lg py-2 text-xs font-semibold">Basic Info</TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg py-2 text-xs font-semibold">Fee Info</TabsTrigger>
          <TabsTrigger value="results" className="rounded-lg py-2 text-xs font-semibold">Results Info</TabsTrigger>
          <TabsTrigger value="other" className="rounded-lg py-2 text-xs font-semibold">Other Info</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6 animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Full Name" value={student.fullName} />
                <DetailRow label="Father's Name" value={student.fatherName} />
                <DetailRow label="Date of Birth" value={student.dob} />
                <DetailRow label="Gender" value={student.gender} />
                <DetailRow label="CNIC / B-Form Number" value={student.cnic} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Mobile Number" value={student.mobile} />
                <DetailRow label="Alternative Contact" value={student.altContact} />
                <DetailRow label="Email Address" value={student.email} />
                <DetailRow label="City" value={student.city} />
                <DetailRow label="Home Address" value={student.address} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-primary" /> Guardian & Family Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Father's Full Name" value={student.fatherFullName || student.fatherName} />
                <DetailRow label="Father's CNIC" value={student.fatherCNIC} />
                <DetailRow label="Occupation" value={student.occupation} />
                <DetailRow label="Father's Phone" value={student.fatherPhone} />
                <DetailRow label="Mother's Name" value={student.motherName} />
                <DetailRow label="Mother's Phone" value={student.motherPhone} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-primary" /> Medical & Health Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Blood Group" value={student.blood} />
                <DetailRow label="Emergency Contact" value={student.emergency} />
                <DetailRow label="Medical Conditions" value={student.medical} />
                <DetailRow label="Disabilities" value={student.disability} />
              </CardContent>
            </Card>
          </div>

          {/* Attached Files */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DocumentBlock label="Student Profile Photo" path={student.photo} />
              <DocumentBlock label="B-Form / CNIC Copy" path={student.bFormCopy} />
              <DocumentBlock label="Previous Result Card" path={student.prevResultCard} />
              <DocumentBlock label="Guardian CNIC Copy" path={student.guardianCnic} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Info Tab */}
        <TabsContent value="fees" className="animate-fade-in-up">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> Fee Billing Dashboard
                </CardTitle>
                <p className="text-xs text-muted-foreground">Monitor transaction status and schedules.</p>
              </div>
              <StatusBadge status={student.feeStatus || "Paid"} />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isFeesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary animate-pulse" />
                  <p className="text-xs text-muted-foreground font-semibold">Loading fee records...</p>
                </div>
              ) : feesError ? (
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <div className="text-xs">
                    <p className="font-bold">Failed to load fee records</p>
                    <p className="opacity-90">{feesError?.data?.message || "Verify your connection or server status."}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/20">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Total Billed</p>
                      <p className="text-xl font-bold mt-1 text-primary">Rs. {totalBilled.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/20">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Total Paid</p>
                      <p className="text-xl font-bold mt-1 text-success">Rs. {totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/20">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Total Due</p>
                      <p className={`text-xl font-bold mt-1 ${totalDue > 0 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
                        Rs. {totalDue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">Monthly Fee Statement</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          const nextMonth = availableMonths[0] || "";
                          setAddForm({
                            month: nextMonth,
                            amount: "",
                            paymentDate: new Date().toISOString().split("T")[0],
                            paymentMethod: "Cash",
                            status: "Paid",
                            remarks: ""
                          });
                          setIsAddOpen(true);
                        }}
                        disabled={availableMonths.length === 0}
                        title={availableMonths.length === 0 ? "All months already configured" : ""}
                        className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-glow"
                      >
                        <Plus className="h-4 w-4" /> Add Month Fee
                      </Button>
                    </div>
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted text-muted-foreground text-left text-xs uppercase font-bold border-b">
                            <th className="p-3">Month</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Payment Date</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Remarks</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">
                                No fee statements set up for this student.
                              </td>
                            </tr>
                          ) : (
                            [...feeRecords]
                              .sort((a, b) => {
                                const indexA = MONTHS_ORDER.indexOf(a.month);
                                const indexB = MONTHS_ORDER.indexOf(b.month);
                                if (indexA === -1) return 1;
                                if (indexB === -1) return -1;
                                return indexA - indexB;
                              })
                              .map((fee) => {
                                return (
                                  <tr key={fee.id} className="border-b hover:bg-muted/10 transition-colors">
                                    <td className="p-3 font-semibold">{fee.month}</td>
                                    <td className="p-3">
                                      <StatusBadge status={fee.status || "Pending"} />
                                    </td>
                                    <td className="p-3 font-medium">Rs. {(fee.amount || 0).toLocaleString()}</td>
                                    <td className="p-3 text-xs text-muted-foreground">
                                      {fee.paymentDate || "—"}
                                    </td>
                                    <td className="p-3 text-xs text-muted-foreground">
                                      {fee.paymentMethod || "—"}
                                    </td>
                                    <td className="p-3 text-xs max-w-[150px] truncate" title={fee.remarks}>
                                      {fee.remarks || "—"}
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="inline-flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleOpenEdit(fee)}
                                          title="Edit details"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-success hover:text-success"
                                          onClick={() => handleOpenPay(fee)}
                                          disabled={fee.status?.toLowerCase() === "paid"}
                                          title="Record Payment"
                                        >
                                          <CreditCard className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteFee(fee.id, fee.month)}
                                          disabled={isDeletingFee}
                                          title="Delete statement"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Info Tab */}
        <TabsContent value="results" className="animate-fade-in-up">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Previous Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Previous School" value={student.prevSchool} />
                <DetailRow label="Previous Percentage / Grade" value={student.lastResult ? `${student.lastResult}%` : undefined} />
                <DetailRow label="Enrollment Date" value={student.admissionDate} />
              </CardContent>
            </Card>

            <Card className="shadow-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Term Exam Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-2" />
                  <h4 className="font-semibold text-foreground">No Current Term Results</h4>
                  <p className="text-xs max-w-xs mt-1">Academic records for this class session are pending final review and publishes.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other Info Tab */}
        <TabsContent value="other" className="animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary" /> Transport & Commute
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Subscribed to Transport" value={student.transport ? "Yes" : "No"} />
                {student.transport && <DetailRow label="Route details / Bus ID" value={student.busRoute || "Route A (Faisalabad)"} />}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-primary" /> Hostel & Lodging
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Living in Hostel" value={student.hostel ? "Yes" : "No"} />
                {student.hostel && <DetailRow label="Room Number" value="Hostel Wing B, Room 102" />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Fee Details Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit {selectedFee ? selectedFee.month : ""} Fee Details
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Total Fee Amount (Rs.)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment-date">Payment Date</Label>
              <Input
                id="edit-payment-date"
                type="date"
                value={editForm.paymentDate}
                onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment-method">Payment Method</Label>
              <select
                id="edit-payment-method"
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-remarks">Remarks</Label>
              <Textarea
                id="edit-remarks"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="Remarks, e.g. Paid in cash"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdatingFee}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground border-0 font-semibold" disabled={isUpdatingFee}>
                {isUpdatingFee ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-success" /> Record {selectedFee ? selectedFee.month : ""} Fee Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePay} className="space-y-4 py-2">
            <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month:</span>
                <span className="font-semibold capitalize">{selectedFee?.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Fee:</span>
                <span className="font-semibold">Rs. {(selectedFee?.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-destructive font-bold border-t pt-1 mt-1">
                <span>Remaining Due:</span>
                <span>Rs. {(selectedFee?.amount || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Payment Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={payForm.paymentDate}
                onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-method">Payment Method</Label>
              <select
                id="pay-method"
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-remarks">Remarks / Description</Label>
              <Textarea
                id="pay-remarks"
                value={payForm.remarks}
                onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                placeholder="Remarks, e.g. Paid in cash"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsPayOpen(false)} disabled={isUpdatingFee}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground border-0 font-semibold" disabled={isUpdatingFee}>
                {isUpdatingFee ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Month Fee Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add Month Fee Configuration
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-month">Select Month</Label>
              <select
                id="add-month"
                value={addForm.month}
                onChange={(e) => setAddForm({ ...addForm, month: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>Select a month...</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-amount">Total Fee Amount (Rs.)</Label>
              <Input
                id="add-amount"
                type="number"
                value={addForm.amount}
                onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <select
                id="add-status"
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-payment-date">Payment Date</Label>
              <Input
                id="add-payment-date"
                type="date"
                value={addForm.paymentDate}
                onChange={(e) => setAddForm({ ...addForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-payment-method">Payment Method</Label>
              <select
                id="add-payment-method"
                value={addForm.paymentMethod}
                onChange={(e) => setAddForm({ ...addForm, paymentMethod: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-remarks">Remarks</Label>
              <Textarea
                id="add-remarks"
                value={addForm.remarks}
                onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                placeholder="Remarks, e.g. Monthly tuition fee"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isCreatingFee}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground border-0 font-semibold" disabled={isCreatingFee}>
                {isCreatingFee ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Configuration
              </Button>
            </DialogFooter>
          </form>
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
