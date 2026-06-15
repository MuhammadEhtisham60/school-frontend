import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useGetStudentsQuery,
  useGetStudentQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} from "@/services/private/studentService";
import { Pencil, Trash2, Eye, GraduationCap, Loader2, FileText, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/stat-card";
import { Formik } from "formik";
import * as Yup from "yup";

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

function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  // View / Edit / Delete States
  const [viewStudentId, setViewStudentId] = useState(null);
  const [editStudentId, setEditStudentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data, isLoading, error } = useGetStudentsQuery({
    search: search || undefined,
    class: classFilter !== "all" ? classFilter : undefined,
    section: sectionFilter !== "all" ? sectionFilter : undefined,
  });

  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const studentsList = data?.students || [];

  const total = studentsList.length;
  const active = studentsList.filter((s) => (s.status || "Active") === "Active").length;
  const fees = studentsList.filter((s) => (s.feeStatus || "Paid") === "Paid").length;

  const triggerDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent(deleteId).unwrap();
      toast.success(`${deleteName} deleted successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || `Failed to delete ${deleteName}`);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      setDeleteName("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Students"
        description="Browse, search and manage every enrolled student."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={total} icon={GraduationCap} variant="primary" />
        <StatCard label="Active" value={active} icon={GraduationCap} variant="success" />
        <StatCard label="Fees Paid" value={fees} icon={GraduationCap} variant="info" />
        <StatCard
          label="Pending Fees"
          value={total - fees}
          icon={GraduationCap}
          variant="warning"
        />
      </div>

      <ListToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => navigate("/admission")}
        addLabel="Admit Student"
      >
        <div className="flex flex-wrap gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((c) => (
                <SelectItem key={c} value={c}>
                  Class {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {["A", "B", "C", "D"].map((s) => (
                <SelectItem key={s} value={s}>
                  Section {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ListToolbar>

      {isLoading ? (
        <Card className="p-12 flex justify-center items-center shadow-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading student directory...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive shadow-card">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load students</p>
            <p className="text-sm opacity-90">{error?.data?.message || "An unexpected error occurred"}</p>
          </div>
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsList.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                        <AvatarImage src={getMediaUrl(s.photo)} />
                        <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(s.fullName || s.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{s.fullName || s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.gender} · {s.dob || "No DOB"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">#{s.rollNo || "N/A"}</TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {s.class}-{s.section}
                    </span>
                  </TableCell>
                  <TableCell>{s.fatherName}</TableCell>
                  <TableCell className="text-sm">{s.mobile || s.contact || "N/A"}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.feeStatus || "Paid"} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status || "Active"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setViewStudentId(s.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditStudentId(s.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => triggerDelete(s.id, s.fullName || s.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {studentsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail Modal */}
      {viewStudentId && (
        <StudentDetailsModal studentId={viewStudentId} onClose={() => setViewStudentId(null)} />
      )}

      {/* Edit Modal */}
      {editStudentId && (
        <StudentEditModal studentId={editStudentId} onClose={() => setEditStudentId(null)} />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student profile for <strong>{deleteName}</strong> and remove their record from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StudentDetailsModal({ studentId, onClose }) {
  const { data, isLoading } = useGetStudentQuery(studentId, { skip: !studentId });
  const student = data?.student;

  return (
    <Dialog open={!!studentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>Full profile of the enrolled student.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : student ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={getMediaUrl(student.photo)} />
                <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-bold">
                  {getInitials(student.fullName || student.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold">{student.fullName || student.name}</h3>
                <p className="text-sm text-muted-foreground">Roll No: {student.rollNo || "N/A"}</p>
                <p className="text-sm font-semibold text-primary">
                  Class {student.class} - Section {student.section}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoBlock label="Father's Name" value={student.fatherName} />
              <InfoBlock label="Date of Birth" value={student.dob} />
              <InfoBlock label="Gender" value={student.gender} />
              <InfoBlock label="CNIC / B-Form" value={student.cnic} />
              <InfoBlock label="Mobile" value={student.mobile || student.contact} />
              <InfoBlock label="Previous School" value={student.prevSchool} />
              <InfoBlock label="Last Result (%)" value={student.lastResult} />
              <InfoBlock label="Admission Date" value={student.admissionDate} />
              <InfoBlock label="Transport" value={student.transport ? "Yes" : "No"} />
              <InfoBlock label="Hostel" value={student.hostel ? "Yes" : "No"} />
            </div>

            {/* Documents */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Attached Documents
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                <DocLink label="Student Photo" path={student.studentPhoto} />
                <DocLink label="B-Form Copy" path={student.bFormCopy} />
                <DocLink label="Previous Result Card" path={student.prevResultCard} />
                <DocLink label="Guardian CNIC" path={student.guardianCnic} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Student details not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-muted/20 border">
      <p className="text-xs text-muted-foreground uppercase font-semibold">{label}</p>
      <p className="font-medium mt-0.5">{value !== undefined && value !== null && value !== "" ? String(value) : "—"}</p>
    </div>
  );
}

function DocLink({ label, path }) {
  if (!path) return null;
  return (
    <a
      href={getMediaUrl(path)}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-muted/80 border text-xs font-medium text-primary transition-smooth"
    >
      <Download className="h-3.5 w-3.5" />
      <span>{label}</span>
    </a>
  );
}

function StudentEditModal({ studentId, onClose }) {
  const { data, isLoading: isDetailLoading } = useGetStudentQuery(studentId, { skip: !studentId });
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const student = data?.student;

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    fatherName: Yup.string().required("Father's name is required"),
    dob: Yup.string().required("Date of birth is required"),
    gender: Yup.string().required("Gender is required"),
    class: Yup.string().required("Admission class is required"),
    section: Yup.string().required("Section is required"),
    mobile: Yup.string().required("Mobile number is required"),
  });

  const getInitialValues = () => {
    if (!student) return {};
    return {
      fullName: student.fullName || student.name || "",
      fatherName: student.fatherName || "",
      dob: student.dob || "",
      gender: student.gender || "",
      class: student.class || "",
      section: student.section || "",
      mobile: student.mobile || student.contact || "",
      cnic: student.cnic || "",
      prevSchool: student.prevSchool || "",
      lastResult: student.lastResult || "",
      transport: student.transport || false,
      hostel: student.hostel || false,
      photo: null,
      studentPhoto: null,
      bFormCopy: null,
      prevResultCard: null,
      guardianCnic: null,
    };
  };

  return (
    <Dialog open={!!studentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
          <DialogDescription>Modify the fields below to update student details.</DialogDescription>
        </DialogHeader>

        {isDetailLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : student ? (
          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                  if (value !== null && value !== undefined) {
                    formData.append(key, value);
                  }
                });
                await updateStudent({ id: studentId, formData }).unwrap();
                toast.success("Student updated successfully!");
                onClose();
              } catch (err) {
                toast.error(err?.data?.message || "Failed to update student.");
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit }) => (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={values.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.fullName && touched.fullName && (
                      <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      value={values.fatherName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.fatherName && touched.fatherName && (
                      <p className="text-xs text-destructive mt-1">{errors.fatherName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={values.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.dob && touched.dob && (
                      <p className="text-xs text-destructive mt-1">{errors.dob}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={values.gender}
                      onValueChange={(val) => setFieldValue("gender", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && touched.gender && (
                      <p className="text-xs text-destructive mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select
                      value={values.class}
                      onValueChange={(val) => setFieldValue("class", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((c) => (
                          <SelectItem key={c} value={c}>
                            Class {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.class && touched.class && (
                      <p className="text-xs text-destructive mt-1">{errors.class}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={values.section}
                      onValueChange={(val) => setFieldValue("section", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((s) => (
                          <SelectItem key={s} value={s}>
                            Section {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.section && touched.section && (
                      <p className="text-xs text-destructive mt-1">{errors.section}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={values.mobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.mobile && touched.mobile && (
                      <p className="text-xs text-destructive mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cnic">CNIC / B-Form</Label>
                    <Input
                      id="cnic"
                      name="cnic"
                      value={values.cnic}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prevSchool">Previous School</Label>
                    <Input
                      id="prevSchool"
                      name="prevSchool"
                      value={values.prevSchool}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastResult">Last Result (%)</Label>
                    <Input
                      id="lastResult"
                      name="lastResult"
                      value={values.lastResult}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <div className="flex gap-6 py-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="transport"
                      checked={values.transport}
                      onChange={(e) => setFieldValue("transport", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    Transport Services
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="hostel"
                      checked={values.hostel}
                      onChange={(e) => setFieldValue("hostel", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    Hostel Services
                  </label>
                </div>

                <div className="border-t pt-4 mt-4 space-y-3">
                  <h4 className="text-sm font-semibold">Update Documents (Optional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="photo">Profile Photo</Label>
                      <Input
                        id="photo"
                        type="file"
                        onChange={(e) => setFieldValue("photo", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentPhoto">Documents Photo</Label>
                      <Input
                        id="studentPhoto"
                        type="file"
                        onChange={(e) => setFieldValue("studentPhoto", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bFormCopy">B-Form Copy</Label>
                      <Input
                        id="bFormCopy"
                        type="file"
                        onChange={(e) => setFieldValue("bFormCopy", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <Label htmlFor="prevResultCard">Previous Result Card</Label>
                      <Input
                        id="prevResultCard"
                        type="file"
                        onChange={(e) => setFieldValue("prevResultCard", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardianCnic">Guardian CNIC</Label>
                      <Input
                        id="guardianCnic"
                        type="file"
                        onChange={(e) => setFieldValue("guardianCnic", e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary text-primary-foreground shadow-glow" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            )}
          </Formik>
        ) : (
          <p className="text-center text-muted-foreground">Student details not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default StudentsPage;
