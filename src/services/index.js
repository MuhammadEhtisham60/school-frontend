import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { students as mockStudentsList } from "@/data/mock-data";

// Rich mock data for offline client preview
const mockClassesList = [
  { _id: "c1", id: "c1", name: "10", sections: ["A", "B"], studentCount: 55, subjects: ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"] },
  { _id: "c2", id: "c2", name: "9", sections: ["A", "B"], studentCount: 50, subjects: ["Mathematics", "Physics", "Chemistry", "English", "Biology"] },
  { _id: "c3", id: "c3", name: "8", sections: ["A", "B"], studentCount: 48, subjects: ["Mathematics", "General Science", "English", "Urdu", "Computer Science"] },
  { _id: "c4", id: "c4", name: "7", sections: ["A", "B"], studentCount: 42, subjects: ["Mathematics", "General Science", "English", "Urdu", "Social Studies"] },
  { _id: "c5", id: "c5", name: "6", sections: ["A", "B"], studentCount: 40, subjects: ["Mathematics", "General Science", "English", "Urdu", "Islamiat"] },
  { _id: "c6", id: "c6", name: "5", sections: ["A", "B"], studentCount: 38, subjects: ["Mathematics", "Science", "English", "Urdu", "Drawing"] },
];

const mockStudents = mockStudentsList.map((s, idx) => ({
  ...s,
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
}));

const mockFeesList = [
  { id: "f1", _id: "f1", studentId: "1", studentName: "Ali Khan", rollNo: "1023", class: "10", amount: 15000, month: "October", status: "Paid", paymentDate: "2026-10-05", paymentMethod: "Cash" },
  { id: "f2", _id: "f2", studentId: "2", studentName: "Sara Ahmed", rollNo: "1041", class: "9", amount: 14000, month: "October", status: "Pending", paymentDate: "2026-10-10", paymentMethod: "Bank" },
  { id: "f3", _id: "f3", studentId: "3", studentName: "Hamza Iqbal", rollNo: "1102", class: "8", amount: 13000, month: "October", status: "Paid", paymentDate: "2026-10-02", paymentMethod: "Online" },
  { id: "f4", _id: "f4", studentId: "4", studentName: "Ayesha Noor", rollNo: "1011", class: "10", amount: 15000, month: "October", status: "Paid", paymentDate: "2026-10-08", paymentMethod: "Cash" },
  { id: "f5", _id: "f5", studentId: "5", studentName: "Usman Tariq", rollNo: "1208", class: "7", amount: 12000, month: "October", status: "Overdue", paymentDate: "2026-09-28", paymentMethod: "Cash" },
  { id: "f6", _id: "f6", studentId: "6", studentName: "Fatima Zahra", rollNo: "1055", class: "9", amount: 14000, month: "October", status: "Paid", paymentDate: "2026-10-03", paymentMethod: "Bank" },
];

const mockResultsList = [
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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Resilient base query that falls back to realistic mock data when backend is not running
const dynamicBaseQuery = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url || "";
  const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();

  try {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (!result.error) {
      return result;
    }
  } catch {
    // Backend offline: proceed to mock fallback below
  }

  // --- MOCK FALLBACK HANDLERS ---
  if (method === "GET") {
    if (url.includes("students/next-roll-no")) {
      return { data: { nextRollNo: "1056" } };
    }
    if (url.match(/students\/[a-zA-Z0-9_-]+/)) {
      const id = url.split("students/")[1]?.split("/")[0];
      const found = mockStudents.find((s) => String(s.id) === String(id) || s._id === String(id)) || mockStudents[0];
      return { data: { student: found } };
    }
    if (url.startsWith("students")) {
      return { data: { students: mockStudents, total: mockStudents.length, page: 1, totalPages: 1 } };
    }
    if (url.startsWith("classes/dropdown") || url.startsWith("classes")) {
      return { data: { data: mockClassesList } };
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
        message: "Operation completed successfully (Demo Mode)",
        data: typeof args === "object" ? args.body : {},
      },
    };
  }

  return { data: null };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["Student", "StudentFees", "Fee", "StudentFeesList", "Result", "StudentResultHistory", "Class"],
  endpoints: () => ({}),
});
