import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetStudentQuery } from "@/services/private/studentService";
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
} from "lucide-react";

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
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Fee Status</p>
                  <p className="text-xl font-bold mt-1 text-primary">{student.feeStatus || "Paid"}</p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Assigned Fee Group</p>
                  <p className="text-xl font-bold mt-1">Class {student.class} Standard</p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Pending Charges</p>
                  <p className="text-xl font-bold mt-1 text-destructive">
                    {student.feeStatus === "Pending" ? "Rs. 15,000" : student.feeStatus === "Overdue" ? "Rs. 25,000" : "Rs. 0"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Invoices</h3>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted text-muted-foreground text-left text-xs uppercase font-bold border-b">
                        <th className="p-3">Invoice ID</th>
                        <th className="p-3">Billing Month</th>
                        <th className="p-3">Amount Due</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/10">
                        <td className="p-3 font-mono">INV-2026-092</td>
                        <td className="p-3">June 2026</td>
                        <td className="p-3 font-semibold">Rs. 15,000</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">Paid</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/10">
                        <td className="p-3 font-mono">INV-2026-054</td>
                        <td className="p-3">May 2026</td>
                        <td className="p-3 font-semibold">Rs. 15,000</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">Paid</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
