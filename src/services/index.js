import { createApi } from "@reduxjs/toolkit/query/react";
import { students as mockStudentsList } from "@/data/mock-data";

const INITIAL_CLASSES = [
  { _id: "c1", id: "c1", name: "10", sections: ["A", "B"], studentCount: 55, isActive: true, displayOrder: 10, subjects: ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"] },
  { _id: "c2", id: "c2", name: "9", sections: ["A", "B"], studentCount: 50, isActive: true, displayOrder: 9, subjects: ["Mathematics", "Physics", "Chemistry", "English", "Biology"] },
  { _id: "c3", id: "c3", name: "8", sections: ["A", "B"], studentCount: 48, isActive: true, displayOrder: 8, subjects: ["Mathematics", "General Science", "English", "Urdu", "Computer Science"] },
  { _id: "c4", id: "c4", name: "7", sections: ["A", "B"], studentCount: 42, isActive: true, displayOrder: 7, subjects: ["Mathematics", "General Science", "English", "Urdu", "Social Studies"] },
  { _id: "c5", id: "c5", name: "6", sections: ["A", "B"], studentCount: 40, isActive: true, displayOrder: 6, subjects: ["Mathematics", "General Science", "English", "Urdu", "Islamiat"] },
  { _id: "c6", id: "c6", name: "5", sections: ["A", "B"], studentCount: 38, isActive: true, displayOrder: 5, subjects: ["Mathematics", "Science", "English", "Urdu", "Drawing"] },
];

const INITIAL_TEACHERS = [
  {
    id: "1",
    _id: "1",
    employeeId: "EMP-101",
    fullName: "Sara Mahmood",
    name: "Sara Mahmood",
    fatherOrSpouseName: "Mahmood Akhtar",
    dob: "1989-04-14",
    gender: "Female",
    cnic: "35202-4123987-2",
    bloodGroup: "O+",
    maritalStatus: "Married",
    religion: "Islam",
    phone: "0321-1234567",
    altPhone: "0300-9871234",
    email: "sara@school.pk",
    emergencyContact: "0300-9871234",
    city: "Lahore",
    address: "House 42, Block C, Model Town, Lahore",
    designation: "Head of Department",
    department: "Mathematics",
    subject: "Mathematics",
    secondarySubjects: ["Statistics", "Further Mathematics"],
    qualification: "MSc Mathematics, B.Ed",
    specialization: "Applied & Pure Calculus",
    university: "University of the Punjab",
    passingYear: "2014",
    experience: 8,
    previousInstitution: "Beaconhouse School System",
    joiningDate: "2019-08-01",
    employmentType: "Full-time",
    type: "Full-time",
    status: "Active",
    is_active: true,
    classes: ["9", "10"],
    assignedClasses: ["9", "10"],
    assignedSections: ["A", "B"],
    classTeacherOf: "10-A",
    weeklyWorkload: 24,
    schedule: [
      { id: "p1", day: "Monday", period: "1st Period", startTime: "08:00", endTime: "08:45", className: "10", section: "A", subject: "Mathematics", room: "Room 201" },
      { id: "p2", day: "Tuesday", period: "2nd Period", startTime: "08:45", endTime: "09:30", className: "9", section: "B", subject: "Mathematics", room: "Room 104" },
      { id: "p3", day: "Wednesday", period: "1st Period", startTime: "08:00", endTime: "08:45", className: "10", section: "B", subject: "Mathematics", room: "Room 202" },
      { id: "p4", day: "Thursday", period: "3rd Period", startTime: "09:30", endTime: "10:15", className: "9", section: "A", subject: "Mathematics", room: "Room 103" },
      { id: "p5", day: "Friday", period: "1st Period", startTime: "08:00", endTime: "08:45", className: "10", section: "A", subject: "Mathematics", room: "Room 201" },
    ],
    basicSalary: 68000,
    allowances: 10000,
    deductions: 3000,
    salary: 75000,
    bankName: "Meezan Bank",
    bankAccountNo: "0102-884392011",
    iban: "PK36MEZN0001020884392011",
    paymentMethod: "Bank Transfer",
    remarks: "Gold Medalist in MSc Mathematics; leads Olympiad prep.",
  },
  {
    id: "2",
    _id: "2",
    employeeId: "EMP-102",
    fullName: "Ahmad Raza",
    name: "Ahmad Raza",
    fatherOrSpouseName: "Raza Hussain",
    dob: "1984-11-20",
    gender: "Male",
    cnic: "35201-7645123-1",
    bloodGroup: "B+",
    maritalStatus: "Married",
    religion: "Islam",
    phone: "0322-9876543",
    altPhone: "0333-4112233",
    email: "ahmad@school.pk",
    emergencyContact: "0333-4112233",
    city: "Lahore",
    address: "78-B, Johar Town Phase II, Lahore",
    designation: "Senior Subject Specialist",
    department: "Science",
    subject: "Physics",
    secondarySubjects: ["Mathematics", "Astronomy Club"],
    qualification: "MPhil Physics",
    specialization: "Quantum Mechanics & Electromagnetism",
    university: "GC University Lahore",
    passingYear: "2011",
    experience: 12,
    previousInstitution: "Lahore Grammar School",
    joiningDate: "2015-03-15",
    employmentType: "Full-time",
    type: "Full-time",
    status: "Active",
    is_active: true,
    classes: ["9", "10"],
    assignedClasses: ["9", "10"],
    assignedSections: ["A", "B"],
    classTeacherOf: "10-B",
    weeklyWorkload: 22,
    schedule: [
      { id: "p1", day: "Monday", period: "2nd Period", startTime: "08:45", endTime: "09:30", className: "10", section: "A", subject: "Physics", room: "Physics Lab" },
      { id: "p2", day: "Tuesday", period: "1st Period", startTime: "08:00", endTime: "08:45", className: "10", section: "B", subject: "Physics", room: "Physics Lab" },
      { id: "p3", day: "Wednesday", period: "4th Period", startTime: "10:45", endTime: "11:30", className: "9", section: "A", subject: "Physics", room: "Room 103" },
    ],
    basicSalary: 85000,
    allowances: 14000,
    deductions: 4000,
    salary: 95000,
    bankName: "HBL",
    bankAccountNo: "0042-7991234503",
    iban: "PK19HABB0000427991234503",
    paymentMethod: "Bank Transfer",
    remarks: "In-charge of Senior Science & Physics Lab.",
  },
  {
    id: "3",
    _id: "3",
    employeeId: "EMP-103",
    fullName: "Hina Tariq",
    name: "Hina Tariq",
    fatherOrSpouseName: "Tariq Javed",
    dob: "1992-07-08",
    gender: "Female",
    cnic: "35202-9911223-4",
    bloodGroup: "A+",
    maritalStatus: "Single",
    religion: "Islam",
    phone: "0333-4567890",
    altPhone: "0321-4561111",
    email: "hina@school.pk",
    emergencyContact: "0321-4561111",
    city: "Lahore",
    address: "Street 9, Cavalry Ground, Lahore",
    designation: "Senior Teacher",
    department: "Languages",
    subject: "English",
    secondarySubjects: ["English Literature", "Debate & Spoken English"],
    qualification: "MA English Literature",
    specialization: "Linguistics & Creative Writing",
    university: "Kinnaird College",
    passingYear: "2016",
    experience: 6,
    previousInstitution: "The City School",
    joiningDate: "2020-01-10",
    employmentType: "Full-time",
    type: "Full-time",
    status: "Active",
    is_active: true,
    classes: ["7", "8", "9"],
    assignedClasses: ["7", "8", "9"],
    assignedSections: ["A", "B"],
    classTeacherOf: "9-A",
    weeklyWorkload: 26,
    schedule: [
      { id: "p1", day: "Monday", period: "3rd Period", startTime: "09:30", endTime: "10:15", className: "9", section: "A", subject: "English", room: "Room 103" },
      { id: "p2", day: "Wednesday", period: "2nd Period", startTime: "08:45", endTime: "09:30", className: "8", section: "A", subject: "English", room: "Room 102" },
    ],
    basicSalary: 62000,
    allowances: 8500,
    deductions: 2500,
    salary: 68000,
    bankName: "UBL",
    bankAccountNo: "0912-234509811",
    iban: "PK88UNIL0109000234509811",
    paymentMethod: "Bank Transfer",
    remarks: "Patron of the Literary & Debating Society.",
  },
  {
    id: "4",
    _id: "4",
    employeeId: "EMP-104",
    fullName: "Kamran Siddiqui",
    name: "Kamran Siddiqui",
    fatherOrSpouseName: "Siddiqui Ahmed",
    dob: "1990-02-19",
    gender: "Male",
    cnic: "35202-1122334-9",
    bloodGroup: "AB+",
    maritalStatus: "Married",
    religion: "Islam",
    phone: "0345-2345678",
    altPhone: "0300-2345678",
    email: "kamran@school.pk",
    emergencyContact: "0300-2345678",
    city: "Lahore",
    address: "Garden Town, Block A, Lahore",
    designation: "IT & CS Coordinator",
    department: "Computer Science",
    subject: "Computer Science",
    secondarySubjects: ["Robotics", "Web Development"],
    qualification: "BS Computer Science",
    specialization: "Software Engineering & AI",
    university: "FAST-NUCES",
    passingYear: "2015",
    experience: 5,
    previousInstitution: "Roots Millennium Schools",
    joiningDate: "2021-09-01",
    employmentType: "Full-time",
    type: "Full-time",
    status: "Active",
    is_active: true,
    classes: ["8", "9", "10"],
    assignedClasses: ["8", "9", "10"],
    assignedSections: ["A", "B"],
    classTeacherOf: "8-A",
    weeklyWorkload: 24,
    schedule: [
      { id: "p1", day: "Monday", period: "4th Period", startTime: "10:45", endTime: "11:30", className: "10", section: "A", subject: "Computer Science", room: "IT Lab 1" },
      { id: "p2", day: "Thursday", period: "2nd Period", startTime: "08:45", endTime: "09:30", className: "8", section: "A", subject: "Computer Science", room: "IT Lab 1" },
    ],
    basicSalary: 72000,
    allowances: 10000,
    deductions: 2000,
    salary: 80000,
    bankName: "Allied Bank",
    bankAccountNo: "0010-0456789100",
    iban: "PK44ABPA0010004567891000",
    paymentMethod: "Bank Transfer",
    remarks: "Supervises computer labs and campus LMS.",
  },
  {
    id: "5",
    _id: "5",
    employeeId: "EMP-105",
    fullName: "Nadia Batool",
    name: "Nadia Batool",
    fatherOrSpouseName: "Syed Batool Shah",
    dob: "1986-09-25",
    gender: "Female",
    cnic: "35201-5566778-2",
    bloodGroup: "O-",
    maritalStatus: "Married",
    religion: "Islam",
    phone: "0312-8765432",
    altPhone: "0312-1112233",
    email: "nadia@school.pk",
    emergencyContact: "0312-1112233",
    city: "Lahore",
    address: "DHA Phase 4, Sector FF, Lahore",
    designation: "Senior Lecturer",
    department: "Science",
    subject: "Biology",
    secondarySubjects: ["Chemistry", "Environmental Science"],
    qualification: "MPhil Botany",
    specialization: "Molecular Biology & Genetics",
    university: "Quaid-i-Azam University",
    passingYear: "2013",
    experience: 9,
    previousInstitution: "APSACS",
    joiningDate: "2018-04-05",
    employmentType: "Part-time",
    type: "Part-time",
    status: "Active",
    is_active: true,
    classes: ["9", "10"],
    assignedClasses: ["9", "10"],
    assignedSections: ["A"],
    classTeacherOf: "9-B",
    weeklyWorkload: 16,
    schedule: [
      { id: "p1", day: "Tuesday", period: "3rd Period", startTime: "09:30", endTime: "10:15", className: "9", section: "B", subject: "Biology", room: "Bio Lab" },
      { id: "p2", day: "Friday", period: "2nd Period", startTime: "08:45", endTime: "09:30", className: "10", section: "A", subject: "Biology", room: "Bio Lab" },
    ],
    basicSalary: 50000,
    allowances: 7000,
    deductions: 2000,
    salary: 55000,
    bankName: "Bank Alfalah",
    bankAccountNo: "0156-1004599201",
    iban: "PK71ALFH0156001004599201",
    paymentMethod: "Bank Transfer",
    remarks: "Part-time visiting specialist for Matric Biology.",
  },
  {
    id: "6",
    _id: "6",
    employeeId: "EMP-106",
    fullName: "Zubair Akram",
    name: "Zubair Akram",
    fatherOrSpouseName: "Muhammad Akram",
    dob: "1980-12-12",
    gender: "Male",
    cnic: "35202-8877665-5",
    bloodGroup: "B-",
    maritalStatus: "Married",
    religion: "Islam",
    phone: "0301-3344556",
    altPhone: "0300-3344550",
    email: "zubair@school.pk",
    emergencyContact: "0300-3344550",
    city: "Lahore",
    address: "Allama Iqbal Town, Huma Block, Lahore",
    designation: "Senior Urdu & Humanities Teacher",
    department: "Islamiat & Urdu",
    subject: "Urdu",
    secondarySubjects: ["Islamiat", "Pakistan Studies"],
    qualification: "MA Urdu, M.Ed",
    specialization: "Classical Urdu Prose & Poetry",
    university: "University of the Punjab",
    passingYear: "2008",
    experience: 14,
    previousInstitution: "Divisional Public School",
    joiningDate: "2014-08-20",
    employmentType: "Full-time",
    type: "Full-time",
    status: "On Leave",
    is_active: false,
    classes: ["6", "7", "8"],
    assignedClasses: ["6", "7", "8"],
    assignedSections: ["A", "B"],
    classTeacherOf: "7-A",
    weeklyWorkload: 25,
    schedule: [
      { id: "p1", day: "Monday", period: "1st Period", startTime: "08:00", endTime: "08:45", className: "7", section: "A", subject: "Urdu", room: "Room 101" },
      { id: "p2", day: "Wednesday", period: "3rd Period", startTime: "09:30", endTime: "10:15", className: "6", section: "A", subject: "Urdu", room: "Room 100" },
    ],
    basicSalary: 66000,
    allowances: 9000,
    deductions: 3000,
    salary: 72000,
    bankName: "MCB Bank",
    bankAccountNo: "0451-332190874",
    iban: "PK62MCIB0000451332190874",
    paymentMethod: "Bank Transfer",
    remarks: "Currently on approved medical leave.",
  },
];

// Build initial salaries from teachers
const buildInitialSalaries = (teachers) => {
  const list = [];
  let sid = 1;
  teachers.forEach((t, idx) => {
    ["September", "October", "November"].forEach((m, mIdx) => {
      const isPending = m === "November" && idx % 3 === 2;
      const bonus = m === "October" ? 2500 : 0;
      const net = Number(t.basicSalary || t.salary || 0) + Number(t.allowances || 0) + bonus - Number(t.deductions || 0);
      list.push({
        id: String(sid),
        _id: String(sid),
        teacherId: {
          id: String(t.id),
          _id: String(t.id),
          name: t.fullName || t.name,
          employeeId: t.employeeId,
          subject: t.subject,
          department: t.department,
          designation: t.designation,
        },
        month: m,
        year: "2026",
        basicSalary: Number(t.basicSalary || t.salary || 0),
        allowances: Number(t.allowances || 0),
        bonus,
        deductions: Number(t.deductions || 0),
        netAmount: net,
        amount: net,
        paymentDate: isPending ? "" : `2026-${String(9 + mIdx).padStart(2, "0")}-05`,
        paymentMethod: t.paymentMethod || "Bank Transfer",
        transactionRef: isPending ? "" : `TRX-${t.employeeId}-${m.slice(0, 3).toUpperCase()}`,
        status: isPending ? "Pending" : "Paid",
        remarks: isPending ? "Pending monthly disbursement" : `Salary disbursed for ${m} 2026`,
      });
      sid++;
    });
  });
  return list;
};

const INITIAL_LEAVES = [
  {
    id: "1",
    _id: "1",
    teacherId: {
      id: "6",
      _id: "6",
      name: "Zubair Akram",
      employeeId: "EMP-106",
      subject: "Urdu",
      department: "Islamiat & Urdu",
    },
    leaveType: "Medical Leave",
    startDate: "2026-11-10",
    endDate: "2026-11-18",
    days: 8,
    reason: "Post-surgery recovery advised by physician",
    status: "Approved",
    approvedBy: "Principal",
    remarks: "Substitute teacher arranged for classes 6, 7, 8",
  },
  {
    id: "2",
    _id: "2",
    teacherId: {
      id: "3",
      _id: "3",
      name: "Hina Tariq",
      employeeId: "EMP-103",
      subject: "English",
      department: "Languages",
    },
    leaveType: "Casual Leave",
    startDate: "2026-11-22",
    endDate: "2026-11-23",
    days: 2,
    reason: "Family wedding ceremony in Islamabad",
    status: "Pending",
    approvedBy: "",
    remarks: "Awaiting HOD approval",
  },
];

// Mutable runtime stores (persisted in localStorage so reloads preserve CRUD changes)
const loadStore = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return fallback;
};

const saveStore = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // ignore
  }
};

let mockClasses = loadStore("edupulse_mock_classes_v2", INITIAL_CLASSES);
let mockStudents = loadStore(
  "edupulse_mock_students_v2",
  mockStudentsList.map((s, idx) => ({
    ...s,
    id: String(s.id || idx + 1),
    _id: String(s.id || idx + 1),
    fullName: s.name,
    rollNumber: s.rollNo || String(1000 + idx + 1),
    emergencyContact: s.contact,
    is_active: s.status === "Active",
    admissionNumber: `ADM-${202400 + idx + 1}`,
    feeStatus: s.feeStatus || "Paid",
    classId: { _id: `c${s.class}`, name: String(s.class) },
    previousSchool: "City Model School",
    bloodGroup: "O+",
    guardianRelation: "Father",
  }))
);
let mockTeachers = loadStore("edupulse_mock_teachers_v2", INITIAL_TEACHERS);
let mockTeacherSalaries = loadStore(
  "edupulse_mock_teacher_salaries_v2",
  buildInitialSalaries(mockTeachers)
);
let mockTeacherLeaves = loadStore("edupulse_mock_teacher_leaves_v2", INITIAL_LEAVES);
let mockTeacherAttendance = loadStore("edupulse_mock_teacher_attendance_v2", []);

let mockFeesList = [
  { id: "f1", _id: "f1", studentId: "1", studentName: "Ali Khan", rollNo: "1023", class: "10", amount: 15000, month: "October", status: "Paid", paymentDate: "2026-10-05", paymentMethod: "Cash" },
  { id: "f2", _id: "f2", studentId: "2", studentName: "Sara Ahmed", rollNo: "1041", class: "9", amount: 14000, month: "October", status: "Pending", paymentDate: "2026-10-10", paymentMethod: "Bank" },
  { id: "f3", _id: "f3", studentId: "3", studentName: "Hamza Iqbal", rollNo: "1102", class: "8", amount: 13000, month: "October", status: "Paid", paymentDate: "2026-10-02", paymentMethod: "Online" },
  { id: "f4", _id: "f4", studentId: "4", studentName: "Ayesha Noor", rollNo: "1011", class: "10", amount: 15000, month: "October", status: "Paid", paymentDate: "2026-10-08", paymentMethod: "Cash" },
  { id: "f5", _id: "f5", studentId: "5", studentName: "Usman Tariq", rollNo: "1208", class: "7", amount: 12000, month: "October", status: "Overdue", paymentDate: "2026-09-28", paymentMethod: "Cash" },
  { id: "f6", _id: "f6", studentId: "6", studentName: "Fatima Zahra", rollNo: "1055", class: "9", amount: 14000, month: "October", status: "Paid", paymentDate: "2026-10-03", paymentMethod: "Bank" },
];

let mockResultsList = [
  { id: "r1", _id: "r1", studentId: "1", studentName: "Ali Khan", rollNo: "1023", class: "10", termName: "First Term", academicYear: "2026-2027", marksObtained: 465, totalMarks: 500, grade: "A+", percentage: 93, promotionStatus: "Promoted" },
  { id: "r2", _id: "r2", studentId: "2", studentName: "Sara Ahmed", rollNo: "1041", class: "9", termName: "First Term", academicYear: "2026-2027", marksObtained: 420, totalMarks: 500, grade: "A", percentage: 84, promotionStatus: "Promoted" },
  { id: "r3", _id: "r3", studentId: "3", studentName: "Hamza Iqbal", rollNo: "1102", class: "8", termName: "First Term", academicYear: "2026-2027", marksObtained: 440, totalMarks: 500, grade: "A", percentage: 88, promotionStatus: "Promoted" },
  { id: "r4", _id: "r4", studentId: "4", studentName: "Ayesha Noor", rollNo: "1011", class: "10", termName: "First Term", academicYear: "2026-2027", marksObtained: 480, totalMarks: 500, grade: "A+", percentage: 96, promotionStatus: "Promoted" },
  { id: "r5", _id: "r5", studentId: "5", studentName: "Usman Tariq", rollNo: "1208", class: "7", termName: "First Term", academicYear: "2026-2027", marksObtained: 385, totalMarks: 500, grade: "B+", percentage: 77, promotionStatus: "Promoted" },
  { id: "r6", _id: "r6", studentId: "6", studentName: "Fatima Zahra", rollNo: "1055", class: "9", termName: "First Term", academicYear: "2026-2027", marksObtained: 450, totalMarks: 500, grade: "A+", percentage: 90, promotionStatus: "Promoted" },
];

const mockProfile = {
  schoolName: "EduPulse International Academy",
  tagline: "Inspiring Excellence & Innovation",
  address: "Main Boulevard, Gulberg III, Lahore",
  contact: "042-35874211",
  email: "contact@edupulse.edu.pk",
  principal: "Dr. Tariq Mehmood",
  academicSession: "2024-2025",
};

const parseBody = (body) => {
  if (!body) return {};
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const obj = {};
    for (const [k, v] of body.entries()) {
      if (typeof v === "string") {
        if ((v.startsWith("[") && v.endsWith("]")) || (v.startsWith("{") && v.endsWith("}"))) {
          try {
            obj[k] = JSON.parse(v);
            continue;
          } catch (e) {
            // keep string
          }
        }
        obj[k] = v;
      }
    }
    return obj;
  }
  return typeof body === "object" ? { ...body } : {};
};

const enrichTeacher = (t) => {
  const salaries = mockTeacherSalaries.filter(
    (s) => String(s.teacherId?.id || s.teacherId) === String(t.id)
  );
  const leaves = mockTeacherLeaves.filter(
    (l) => String(l.teacherId?.id || l.teacherId) === String(t.id)
  );
  const hasPending = salaries.some((s) => String(s.status).toLowerCase() === "pending");
  return {
    ...t,
    id: String(t.id),
    _id: String(t.id),
    fullName: t.fullName || t.name,
    name: t.fullName || t.name,
    classes: t.classes || t.assignedClasses || [],
    assignedClasses: t.classes || t.assignedClasses || [],
    salaryStatus: hasPending ? "Pending" : "Paid",
    salaryHistory: salaries,
    leaves,
  };
};

export const mockBaseQuery = async (args) => {
  const rawUrl = typeof args === "string" ? args : args.url || "";
  const url = rawUrl.replace(/^\/+/, "");
  const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();
  const params = (typeof args === "object" && args.params) || {};
  const body = parseBody(typeof args === "object" ? args.body : undefined);

  // ==========================================
  // TEACHERS CRUD & PAYROLL / LEAVES / ATTENDANCE
  // ==========================================
  if (url.startsWith("teachers/next-employee-id")) {
    const maxNum = mockTeachers.reduce((max, t) => {
      const m = String(t.employeeId || "").match(/(\d+)/);
      return m ? Math.max(max, Number(m[1])) : max;
    }, 100);
    const nextId = `EMP-${maxNum + 1}`;
    return { data: { success: true, employeeId: nextId, nextEmployeeId: nextId } };
  }

  if (url.startsWith("teachers/dropdown")) {
    return {
      data: {
        success: true,
        data: mockTeachers.map((t) => ({
          id: String(t.id),
          _id: String(t.id),
          name: t.fullName || t.name,
          employeeId: t.employeeId,
          subject: t.subject,
          department: t.department,
        })),
      },
    };
  }

  if (url.match(/^teachers\/[^/]+\/salaries/)) {
    const tid = url.split("/")[1];
    const list = mockTeacherSalaries.filter(
      (s) => String(s.teacherId?.id || s.teacherId) === String(tid)
    );
    return { data: { success: true, data: list } };
  }

  if (url.match(/^teachers\/[^/]+\/leaves/)) {
    const tid = url.split("/")[1];
    const list = mockTeacherLeaves.filter(
      (l) => String(l.teacherId?.id || l.teacherId) === String(tid)
    );
    return { data: { success: true, data: list } };
  }

  if (url.match(/^teachers\/[^/]+\/attendance/)) {
    const tid = url.split("/")[1];
    const list = mockTeacherAttendance.filter(
      (a) => String(a.teacherId?.id || a.teacherId) === String(tid)
    );
    return { data: { success: true, data: list } };
  }

  if (url.match(/^teachers\/[^/]+$/)) {
    const tid = url.split("/")[1];
    const idx = mockTeachers.findIndex(
      (t) => String(t.id) === String(tid) || String(t.employeeId) === String(tid)
    );
    if (method === "GET") {
      const found = idx >= 0 ? enrichTeacher(mockTeachers[idx]) : enrichTeacher(mockTeachers[0]);
      return { data: { success: true, teacher: found, data: found } };
    }
    if (method === "PUT" || method === "PATCH") {
      if (idx >= 0) {
        const current = mockTeachers[idx];
        const updated = {
          ...current,
          ...body,
          id: String(current.id),
          _id: String(current.id),
          fullName: body.fullName || body.name || current.fullName || current.name,
          name: body.fullName || body.name || current.fullName || current.name,
          classes: body.classes || body.assignedClasses || current.classes || [],
          assignedClasses: body.classes || body.assignedClasses || current.classes || [],
          salary:
            body.salary !== undefined
              ? Number(body.salary)
              : Number(body.basicSalary ?? current.basicSalary ?? 0) +
                Number(body.allowances ?? current.allowances ?? 0) -
                Number(body.deductions ?? current.deductions ?? 0),
        };
        mockTeachers[idx] = updated;
        saveStore("edupulse_mock_teachers_v2", mockTeachers);
        const enriched = enrichTeacher(updated);
        return { data: { success: true, teacher: enriched, data: enriched } };
      }
    }
    if (method === "DELETE") {
      mockTeachers = mockTeachers.filter(
        (t) => String(t.id) !== String(tid) && String(t.employeeId) !== String(tid)
      );
      mockTeacherSalaries = mockTeacherSalaries.filter(
        (s) => String(s.teacherId?.id || s.teacherId) !== String(tid)
      );
      mockTeacherLeaves = mockTeacherLeaves.filter(
        (l) => String(l.teacherId?.id || l.teacherId) !== String(tid)
      );
      saveStore("edupulse_mock_teachers_v2", mockTeachers);
      saveStore("edupulse_mock_teacher_salaries_v2", mockTeacherSalaries);
      saveStore("edupulse_mock_teacher_leaves_v2", mockTeacherLeaves);
      return { data: { success: true, message: "Teacher deleted successfully" } };
    }
  }

  if (url === "teachers") {
    if (method === "GET") {
      let list = mockTeachers.map(enrichTeacher);
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter(
          (t) =>
            String(t.fullName || t.name).toLowerCase().includes(q) ||
            String(t.subject || "").toLowerCase().includes(q) ||
            String(t.employeeId || "").toLowerCase().includes(q) ||
            String(t.department || "").toLowerCase().includes(q) ||
            String(t.phone || "").toLowerCase().includes(q)
        );
      }
      if (params.department && params.department !== "all") {
        list = list.filter(
          (t) => String(t.department || "").toLowerCase() === String(params.department).toLowerCase()
        );
      }
      if (params.class && params.class !== "all") {
        list = list.filter((t) =>
          (t.classes || []).map((c) => String(c).toLowerCase()).includes(String(params.class).toLowerCase())
        );
      }
      if (params.employmentType && params.employmentType !== "all") {
        list = list.filter(
          (t) =>
            String(t.employmentType || t.type || "").toLowerCase() ===
            String(params.employmentType).toLowerCase()
        );
      }
      if (params.status && params.status !== "all") {
        list = list.filter(
          (t) => String(t.status || "").toLowerCase() === String(params.status).toLowerCase()
        );
      }
      return {
        data: {
          success: true,
          teachers: list,
          data: list,
          total: list.length,
        },
      };
    }
    if (method === "POST") {
      const newId = String(Date.now());
      const basic = Number(body.basicSalary || body.salary || 0);
      const allow = Number(body.allowances || 0);
      const ded = Number(body.deductions || 0);
      const net = body.salary ? Number(body.salary) : Math.max(0, basic + allow - ded);
      const newTeacher = {
        id: newId,
        _id: newId,
        employeeId: body.employeeId || `EMP-${100 + mockTeachers.length + 1}`,
        fullName: body.fullName || body.name || "New Teacher",
        name: body.fullName || body.name || "New Teacher",
        fatherOrSpouseName: body.fatherOrSpouseName || "",
        dob: body.dob || "1990-01-01",
        gender: body.gender || "Male",
        cnic: body.cnic || "",
        bloodGroup: body.bloodGroup || "O+",
        maritalStatus: body.maritalStatus || "Single",
        religion: body.religion || "Islam",
        phone: body.phone || "",
        altPhone: body.altPhone || "",
        email: body.email || "",
        emergencyContact: body.emergencyContact || "",
        city: body.city || "Lahore",
        address: body.address || "",
        designation: body.designation || "Senior Teacher",
        department: body.department || "Science",
        subject: body.subject || "General",
        secondarySubjects: Array.isArray(body.secondarySubjects) ? body.secondarySubjects : [],
        qualification: body.qualification || "MSc",
        specialization: body.specialization || "",
        university: body.university || "",
        passingYear: body.passingYear || "2018",
        experience: Number(body.experience || 1),
        previousInstitution: body.previousInstitution || "",
        joiningDate: body.joiningDate || new Date().toISOString().split("T")[0],
        employmentType: body.employmentType || body.type || "Full-time",
        type: body.employmentType || body.type || "Full-time",
        status: body.status || "Active",
        is_active: (body.status || "Active") === "Active",
        classes: Array.isArray(body.classes) ? body.classes : [],
        assignedClasses: Array.isArray(body.classes) ? body.classes : [],
        assignedSections: Array.isArray(body.assignedSections) ? body.assignedSections : ["A"],
        classTeacherOf: body.classTeacherOf || "",
        weeklyWorkload: Number(body.weeklyWorkload || 24),
        schedule: Array.isArray(body.schedule) ? body.schedule : [],
        basicSalary: basic,
        allowances: allow,
        deductions: ded,
        salary: net,
        bankName: body.bankName || "",
        bankAccountNo: body.bankAccountNo || "",
        iban: body.iban || "",
        paymentMethod: body.paymentMethod || "Bank Transfer",
        remarks: body.remarks || "",
      };
      mockTeachers = [newTeacher, ...mockTeachers];
      saveStore("edupulse_mock_teachers_v2", mockTeachers);
      const enriched = enrichTeacher(newTeacher);
      return { data: { success: true, teacher: enriched, data: enriched } };
    }
  }

  // Teacher Salaries
  if (url.match(/^teacher-salaries\/[^/]+$/)) {
    const sid = url.split("/")[1];
    if (method === "PUT" || method === "PATCH") {
      mockTeacherSalaries = mockTeacherSalaries.map((s) =>
        String(s.id) === String(sid)
          ? {
              ...s,
              ...body,
              netAmount:
                body.netAmount !== undefined
                  ? Number(body.netAmount)
                  : Number(body.basicSalary ?? s.basicSalary ?? 0) +
                    Number(body.allowances ?? s.allowances ?? 0) +
                    Number(body.bonus ?? s.bonus ?? 0) -
                    Number(body.deductions ?? s.deductions ?? 0),
            }
          : s
      );
      saveStore("edupulse_mock_teacher_salaries_v2", mockTeacherSalaries);
      const updated = mockTeacherSalaries.find((s) => String(s.id) === String(sid));
      return { data: { success: true, data: updated } };
    }
    if (method === "DELETE") {
      mockTeacherSalaries = mockTeacherSalaries.filter((s) => String(s.id) !== String(sid));
      saveStore("edupulse_mock_teacher_salaries_v2", mockTeacherSalaries);
      return { data: { success: true, message: "Salary record deleted" } };
    }
  }

  if (url === "teacher-salaries") {
    if (method === "GET") {
      let list = [...mockTeacherSalaries];
      if (params.month && params.month !== "all") {
        list = list.filter((s) => String(s.month).toLowerCase() === String(params.month).toLowerCase());
      }
      if (params.status && params.status !== "all") {
        list = list.filter((s) => String(s.status).toLowerCase() === String(params.status).toLowerCase());
      }
      if (params.teacherId) {
        list = list.filter(
          (s) => String(s.teacherId?.id || s.teacherId) === String(params.teacherId)
        );
      }
      return { data: { success: true, data: list, total: list.length } };
    }
    if (method === "POST") {
      const t = mockTeachers.find((x) => String(x.id) === String(body.teacherId));
      const newSal = {
        id: String(Date.now()),
        _id: String(Date.now()),
        teacherId: {
          id: String(t?.id || body.teacherId),
          _id: String(t?.id || body.teacherId),
          name: t?.fullName || t?.name || "Teacher",
          employeeId: t?.employeeId || "EMP",
          subject: t?.subject || "",
          department: t?.department || "",
          designation: t?.designation || "",
        },
        month: body.month || "November",
        year: body.year || "2026",
        basicSalary: Number(body.basicSalary || t?.basicSalary || t?.salary || 0),
        allowances: Number(body.allowances || 0),
        bonus: Number(body.bonus || 0),
        deductions: Number(body.deductions || 0),
        netAmount: Number(body.netAmount || t?.salary || 0),
        amount: Number(body.netAmount || t?.salary || 0),
        paymentDate: body.paymentDate || new Date().toISOString().split("T")[0],
        paymentMethod: body.paymentMethod || "Bank Transfer",
        transactionRef: body.transactionRef || `TRX-${Date.now().toString().slice(-5)}`,
        status: body.status || "Paid",
        remarks: body.remarks || "",
      };
      mockTeacherSalaries = [newSal, ...mockTeacherSalaries];
      saveStore("edupulse_mock_teacher_salaries_v2", mockTeacherSalaries);
      return { data: { success: true, data: newSal } };
    }
  }

  // Teacher Leaves
  if (url.match(/^teacher-leaves\/[^/]+$/)) {
    const lid = url.split("/")[1];
    if (method === "PUT" || method === "PATCH") {
      mockTeacherLeaves = mockTeacherLeaves.map((l) =>
        String(l.id) === String(lid) ? { ...l, ...body } : l
      );
      saveStore("edupulse_mock_teacher_leaves_v2", mockTeacherLeaves);
      return { data: { success: true } };
    }
    if (method === "DELETE") {
      mockTeacherLeaves = mockTeacherLeaves.filter((l) => String(l.id) !== String(lid));
      saveStore("edupulse_mock_teacher_leaves_v2", mockTeacherLeaves);
      return { data: { success: true } };
    }
  }

  if (url === "teacher-leaves") {
    if (method === "GET") {
      let list = [...mockTeacherLeaves];
      if (params.teacherId) {
        list = list.filter(
          (l) => String(l.teacherId?.id || l.teacherId) === String(params.teacherId)
        );
      }
      return { data: { success: true, data: list } };
    }
    if (method === "POST") {
      const t = mockTeachers.find((x) => String(x.id) === String(body.teacherId));
      const newLeave = {
        id: String(Date.now()),
        _id: String(Date.now()),
        teacherId: {
          id: String(t?.id || body.teacherId),
          _id: String(t?.id || body.teacherId),
          name: t?.fullName || t?.name || "Teacher",
          employeeId: t?.employeeId || "",
          subject: t?.subject || "",
          department: t?.department || "",
        },
        leaveType: body.leaveType || "Casual Leave",
        startDate: body.startDate || new Date().toISOString().split("T")[0],
        endDate: body.endDate || new Date().toISOString().split("T")[0],
        days: Number(body.days || 1),
        reason: body.reason || "",
        status: body.status || "Approved",
        approvedBy: body.approvedBy || "Principal",
        remarks: body.remarks || "",
      };
      mockTeacherLeaves = [newLeave, ...mockTeacherLeaves];
      saveStore("edupulse_mock_teacher_leaves_v2", mockTeacherLeaves);
      return { data: { success: true, data: newLeave } };
    }
  }

  // Teacher Attendance
  if (url === "teacher-attendance") {
    if (method === "GET") {
      let list = [...mockTeacherAttendance];
      if (params.date) {
        list = list.filter((a) => a.date === params.date);
      }
      if (params.teacherId) {
        list = list.filter(
          (a) => String(a.teacherId?.id || a.teacherId) === String(params.teacherId)
        );
      }
      return { data: { success: true, data: list } };
    }
    if (method === "POST") {
      const attDate = body.date || new Date().toISOString().split("T")[0];
      const records = Array.isArray(body.records) ? body.records : [body];
      records.forEach((r) => {
        const t = mockTeachers.find((x) => String(x.id) === String(r.teacherId));
        const existingIdx = mockTeacherAttendance.findIndex(
          (a) =>
            a.date === attDate &&
            String(a.teacherId?.id || a.teacherId) === String(r.teacherId)
        );
        const entry = {
          id: existingIdx >= 0 ? mockTeacherAttendance[existingIdx].id : String(Date.now() + Math.random()),
          teacherId: {
            id: String(t?.id || r.teacherId),
            name: t?.fullName || t?.name || "Teacher",
            employeeId: t?.employeeId || "",
            subject: t?.subject || "",
          },
          date: attDate,
          status: r.status || "Present",
          checkIn: r.checkIn || "07:55 AM",
          checkOut: r.checkOut || "02:00 PM",
          remarks: r.remarks || "",
        };
        if (existingIdx >= 0) {
          mockTeacherAttendance[existingIdx] = entry;
        } else {
          mockTeacherAttendance.unshift(entry);
        }
      });
      saveStore("edupulse_mock_teacher_attendance_v2", mockTeacherAttendance);
      return { data: { success: true, data: mockTeacherAttendance } };
    }
  }

  // ==========================================
  // STUDENTS / CLASSES / FEES / RESULTS
  // ==========================================
  if (method === "GET") {
    if (url.includes("students/next-roll-no")) {
      return { data: { nextRollNo: "1056" } };
    }
    if (url.match(/students\/[a-zA-Z0-9_-]+/)) {
      const id = url.split("students/")[1]?.split("/")[0];
      const found =
        mockStudents.find((s) => String(s.id) === String(id) || String(s._id) === String(id)) ||
        mockStudents[0];
      return { data: { student: found } };
    }
    if (url.startsWith("students")) {
      let list = [...mockStudents];
      if (params.class && params.class !== "all") {
        list = list.filter((s) => String(s.class) === String(params.class));
      }
      if (params.section && params.section !== "all") {
        list = list.filter((s) => String(s.section) === String(params.section));
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter(
          (s) =>
            String(s.fullName || s.name).toLowerCase().includes(q) ||
            String(s.rollNo || "").toLowerCase().includes(q)
        );
      }
      return { data: { students: list, total: list.length, page: 1, totalPages: 1 } };
    }
    if (url.match(/^classes\/[a-zA-Z0-9_-]+$/) && !url.includes("dropdown")) {
      const cid = url.split("/")[1];
      const found =
        mockClasses.find(
          (c) =>
            String(c.id) === String(cid) ||
            String(c._id) === String(cid) ||
            String(c.name) === String(cid)
        ) || mockClasses[0];
      const assignedTeachers = mockTeachers
        .filter((t) => (t.classes || []).includes(String(found.name)))
        .map((t) => ({
          id: String(t.id),
          name: t.fullName || t.name,
          employeeId: t.employeeId,
          subject: t.subject,
          designation: t.designation,
          phone: t.phone,
          classTeacherOf: t.classTeacherOf,
        }));
      return { data: { data: { ...found, teachers: assignedTeachers } } };
    }
    if (url.startsWith("classes/dropdown") || url.startsWith("classes")) {
      return { data: { data: mockClasses } };
    }
    if (url.startsWith("fees/student")) {
      return { data: { data: mockFeesList } };
    }
    if (url.startsWith("fees")) {
      return { data: { data: mockFeesList, total: mockFeesList.length } };
    }
    if (url.startsWith("results/student")) {
      return { data: { data: mockResultsList } };
    }
    if (url.startsWith("results")) {
      return { data: { data: mockResultsList, total: mockResultsList.length } };
    }
    if (url.startsWith("profile")) {
      return { data: { data: mockProfile } };
    }
  }

  if (method === "DELETE" && url.match(/^students\/[a-zA-Z0-9_-]+/)) {
    const id = url.split("students/")[1]?.split("/")[0];
    mockStudents = mockStudents.filter(
      (s) => String(s.id) !== String(id) && String(s._id) !== String(id)
    );
    saveStore("edupulse_mock_students_v2", mockStudents);
    return { data: { success: true, message: "Student deleted successfully" } };
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (url.includes("auth/login")) {
      return {
        data: {
          user: {
            id: "demo-admin",
            email: "admin@admin.com",
            role: "Super Admin",
            firstName: "Demo",
            lastName: "Admin",
            profile: { name: "Demo Admin" },
          },
          token: "demo-token-" + Date.now(),
        },
      };
    }
    return {
      data: {
        success: true,
        message: "Operation completed successfully",
        data: body,
      },
    };
  }

  return { data: null };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: mockBaseQuery,
  tagTypes: [
    "Student",
    "StudentFees",
    "Fee",
    "StudentFeesList",
    "Result",
    "StudentResultHistory",
    "Class",
    "Teacher",
    "TeacherSalary",
    "TeacherLeave",
    "TeacherAttendance",
  ],
  endpoints: () => ({}),
});
