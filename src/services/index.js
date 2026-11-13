import { createApi } from "@reduxjs/toolkit/query/react";
import { students as initialMockStudents } from "@/data/mock-data";

// In-memory mock data store for full interactive CRUD without any backend API
let mockClassesList = [
  {
    _id: "c1",
    id: "c1",
    name: "10",
    displayOrder: 10,
    isActive: true,
    sections: ["A", "B"],
    studentCount: 55,
    subjects: ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"],
  },
  {
    _id: "c2",
    id: "c2",
    name: "9",
    displayOrder: 9,
    isActive: true,
    sections: ["A", "B"],
    studentCount: 50,
    subjects: ["Mathematics", "Physics", "Chemistry", "English", "Biology"],
  },
  {
    _id: "c3",
    id: "c3",
    name: "8",
    displayOrder: 8,
    isActive: true,
    sections: ["A", "B"],
    studentCount: 48,
    subjects: ["Mathematics", "General Science", "English", "Urdu", "Computer Science"],
  },
  {
    _id: "c4",
    id: "c4",
    name: "7",
    displayOrder: 7,
    isActive: true,
    sections: ["A", "B", "C"],
    studentCount: 42,
    subjects: ["Mathematics", "General Science", "English", "Urdu", "Social Studies"],
  },
  {
    _id: "c5",
    id: "c5",
    name: "6",
    displayOrder: 6,
    isActive: true,
    sections: ["A", "B"],
    studentCount: 40,
    subjects: ["Mathematics", "General Science", "English", "Urdu", "Islamiat"],
  },
  {
    _id: "c6",
    id: "c6",
    name: "5",
    displayOrder: 5,
    isActive: true,
    sections: ["A", "B"],
    studentCount: 38,
    subjects: ["Mathematics", "Science", "English", "Urdu", "Drawing"],
  },
];

let mockStudents = initialMockStudents.map((s, idx) => ({
  ...s,
  id: String(s.id || idx + 1),
  _id: String(s.id || idx + 1),
  fullName: s.name,
  rollNo: s.rollNo || String(1000 + idx + 1),
  rollNumber: s.rollNo || String(1000 + idx + 1),
  mobile: s.contact,
  altContact: "0300-9876543",
  email: `${s.name.toLowerCase().replace(/\s+/g, ".")}@student.edupulse.pk`,
  city: s.address,
  cnic: `35202-123456${idx}-1`,
  fatherFullName: s.fatherName,
  fatherCNIC: `35202-765432${idx}-1`,
  fatherPhone: s.contact,
  occupation: "Business",
  motherName: "Mrs. " + (s.fatherName?.split(" ")[0] || "Guardian"),
  motherPhone: "0301-1122334",
  blood: "O+",
  bloodGroup: "O+",
  emergency: s.contact,
  emergencyContact: s.contact,
  medical: "None",
  disability: "None",
  transport: idx % 2 === 0,
  busRoute: idx % 2 === 0 ? "Route 2 - Main Boulevard" : "",
  hostel: false,
  is_active: s.status === "Active",
  isActive: s.status === "Active",
  admissionNumber: `ADM-${202400 + idx + 1}`,
  feeStatus: s.feeStatus || "Paid",
  classFees: 15000,
  class_fees: 15000,
  classId: { _id: `c${s.class}`, name: String(s.class) },
  prevSchool: "City Model School",
  previousSchool: "City Model School",
  lastResult: 88,
  guardianRelation: "Father",
}));

const getStudentRef = (studentId) => {
  const found = mockStudents.find(
    (s) => String(s.id) === String(studentId) || String(s._id) === String(studentId),
  );
  if (found) {
    return {
      id: found.id,
      _id: found._id,
      name: found.fullName || found.name,
      fullName: found.fullName || found.name,
      class: found.class,
      section: found.section,
      rollNo: found.rollNo,
    };
  }
  return {
    id: String(studentId),
    _id: String(studentId),
    name: "Student",
    fullName: "Student",
    class: "10",
    section: "A",
    rollNo: "1000",
  };
};

let mockFeesList = [
  {
    id: "f1",
    _id: "f1",
    studentId: getStudentRef("1"),
    amount: 15000,
    month: "October",
    status: "Paid",
    paymentDate: "2026-10-05",
    paymentMethod: "Cash",
    remarks: "Paid on time",
  },
  {
    id: "f2",
    _id: "f2",
    studentId: getStudentRef("2"),
    amount: 14000,
    month: "October",
    status: "Pending",
    paymentDate: "2026-10-10",
    paymentMethod: "Bank",
    remarks: "",
  },
  {
    id: "f3",
    _id: "f3",
    studentId: getStudentRef("3"),
    amount: 13000,
    month: "October",
    status: "Paid",
    paymentDate: "2026-10-02",
    paymentMethod: "Online",
    remarks: "Online transfer",
  },
  {
    id: "f4",
    _id: "f4",
    studentId: getStudentRef("4"),
    amount: 15000,
    month: "November",
    status: "Paid",
    paymentDate: "2026-11-04",
    paymentMethod: "Cash",
    remarks: "Paid at counter",
  },
  {
    id: "f5",
    _id: "f5",
    studentId: getStudentRef("5"),
    amount: 12000,
    month: "November",
    status: "Pending",
    paymentDate: "2026-11-10",
    paymentMethod: "Cash",
    remarks: "Awaiting payment",
  },
  {
    id: "f6",
    _id: "f6",
    studentId: getStudentRef("6"),
    amount: 14000,
    month: "November",
    status: "Paid",
    paymentDate: "2026-11-03",
    paymentMethod: "Bank",
    remarks: "",
  },
];

const computeTermMetrics = (subjects = [], remarks = "", position = 1) => {
  const normalizedSubjects = subjects.map((s) => {
    const total = Number(s.totalMarks) || 100;
    const obtained = Number(s.obtainedMarks) || 0;
    const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
    return {
      subjectName: s.subjectName,
      totalMarks: total,
      obtainedMarks: obtained,
      percentage: pct,
      grade,
      status: pct >= 40 ? "Pass" : "Fail",
      remarks: s.remarks || "",
    };
  });

  const totalMarks = normalizedSubjects.reduce((sum, s) => sum + s.totalMarks, 0);
  const obtainedMarks = normalizedSubjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const grade =
    percentage >= 90
      ? "A+"
      : percentage >= 80
        ? "A"
        : percentage >= 70
          ? "B"
          : percentage >= 60
            ? "C"
            : percentage >= 50
              ? "D"
              : "F";
  const gpa =
    percentage >= 90
      ? 4.0
      : percentage >= 80
        ? 3.7
        : percentage >= 70
          ? 3.2
          : percentage >= 60
            ? 2.5
            : percentage >= 50
              ? 2.0
              : 0.0;

  return {
    totalMarks,
    obtainedMarks,
    percentage,
    grade,
    gpa,
    position,
    resultStatus: percentage >= 40 ? "Pass" : "Fail",
    remarks,
    subjects: normalizedSubjects,
  };
};

let mockResultsList = [
  {
    id: "r1",
    _id: "r1",
    studentId: getStudentRef("1"),
    rollNo: "1023",
    class: "10",
    section: "A",
    academicYear: "2026-2027",
    promotionStatus: "Promoted",
    terms: {
      "First Term": computeTermMetrics(
        [
          { subjectName: "Mathematics", totalMarks: 100, obtainedMarks: 95, remarks: "Excellent" },
          { subjectName: "Physics", totalMarks: 100, obtainedMarks: 92, remarks: "Very Good" },
          { subjectName: "Chemistry", totalMarks: 100, obtainedMarks: 90, remarks: "Well done" },
          { subjectName: "English", totalMarks: 100, obtainedMarks: 91, remarks: "Strong" },
          { subjectName: "Computer Science", totalMarks: 100, obtainedMarks: 97, remarks: "Top score" },
        ],
        "Outstanding performance across all subjects.",
        1,
      ),
    },
  },
  {
    id: "r2",
    _id: "r2",
    studentId: getStudentRef("2"),
    rollNo: "1041",
    class: "9",
    section: "B",
    academicYear: "2026-2027",
    promotionStatus: "Promoted",
    terms: {
      "First Term": computeTermMetrics(
        [
          { subjectName: "Mathematics", totalMarks: 100, obtainedMarks: 84, remarks: "Good" },
          { subjectName: "Physics", totalMarks: 100, obtainedMarks: 82, remarks: "Good" },
          { subjectName: "Chemistry", totalMarks: 100, obtainedMarks: 80, remarks: "Satisfactory" },
          { subjectName: "English", totalMarks: 100, obtainedMarks: 88, remarks: "Very Good" },
          { subjectName: "Biology", totalMarks: 100, obtainedMarks: 86, remarks: "Good" },
        ],
        "Consistent academic progress.",
        2,
      ),
    },
  },
  {
    id: "r3",
    _id: "r3",
    studentId: getStudentRef("3"),
    rollNo: "1102",
    class: "8",
    section: "A",
    academicYear: "2026-2027",
    promotionStatus: "Promoted",
    terms: {
      "First Term": computeTermMetrics(
        [
          { subjectName: "Mathematics", totalMarks: 100, obtainedMarks: 89, remarks: "Very Good" },
          { subjectName: "General Science", totalMarks: 100, obtainedMarks: 87, remarks: "Good" },
          { subjectName: "English", totalMarks: 100, obtainedMarks: 85, remarks: "Good" },
          { subjectName: "Computer Science", totalMarks: 100, obtainedMarks: 91, remarks: "Excellent" },
        ],
        "Great effort this term.",
        2,
      ),
    },
  },
  {
    id: "r4",
    _id: "r4",
    studentId: getStudentRef("4"),
    rollNo: "1011",
    class: "10",
    section: "A",
    academicYear: "2026-2027",
    promotionStatus: "Promoted",
    terms: {
      "First Term": computeTermMetrics(
        [
          { subjectName: "Mathematics", totalMarks: 100, obtainedMarks: 98, remarks: "Exceptional" },
          { subjectName: "Physics", totalMarks: 100, obtainedMarks: 96, remarks: "Excellent" },
          { subjectName: "Chemistry", totalMarks: 100, obtainedMarks: 95, remarks: "Excellent" },
          { subjectName: "English", totalMarks: 100, obtainedMarks: 94, remarks: "Very Good" },
          { subjectName: "Computer Science", totalMarks: 100, obtainedMarks: 97, remarks: "Excellent" },
        ],
        "Class topper with distinction.",
        1,
      ),
    },
  },
];

let mockProfile = {
  id: "demo-admin",
  firstName: "Tariq",
  lastName: "Mehmood",
  role: "Super Admin",
  schoolName: "EduPulse International Academy",
  tagline: "Inspiring Excellence & Innovation",
  address: "Main Boulevard, Gulberg III, Lahore",
  contact: "042-35874211",
  email: "admin@admin.com",
  principal: "Dr. Tariq Mehmood",
  academicSession: "2026-2027",
};

const parseFormDataOrObject = (body) => {
  if (!body) return {};
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const obj = {};
    body.forEach((value, key) => {
      if (value === "true") obj[key] = true;
      else if (value === "false") obj[key] = false;
      else obj[key] = value;
    });
    return obj;
  }
  return body;
};

// Pure mock base query — no network calls
const mockBaseQuery = async (args) => {
  const url = typeof args === "string" ? args : args.url || "";
  const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();
  const params = (typeof args === "object" && args.params) || {};
  const body = parseFormDataOrObject(typeof args === "object" ? args.body : undefined);

  // --- GET HANDLERS ---
  if (method === "GET") {
    if (url.includes("students/next-roll-no")) {
      const nextNum = 1050 + mockStudents.length + 1;
      return { data: { rollNo: String(nextNum), nextRollNo: String(nextNum) } };
    }

    if (url.match(/^students\/[^/]+\/fees$/)) {
      const id = url.split("/")[1];
      const studentFees = mockFeesList.filter((f) => String(f.studentId?.id) === String(id));
      return { data: { data: studentFees } };
    }

    if (url.match(/^students\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("students/")[1];
      const found =
        mockStudents.find((s) => String(s.id) === String(id) || String(s._id) === String(id)) ||
        mockStudents[0];
      return { data: { student: found } };
    }

    if (url.startsWith("students")) {
      let filtered = [...mockStudents];
      if (params.class) {
        filtered = filtered.filter((s) => String(s.class) === String(params.class));
      }
      if (params.section) {
        filtered = filtered.filter((s) => String(s.section) === String(params.section));
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(
          (s) =>
            (s.fullName || s.name || "").toLowerCase().includes(q) ||
            String(s.rollNo || "").toLowerCase().includes(q),
        );
      }
      return {
        data: {
          students: filtered,
          total: filtered.length,
          page: 1,
          totalPages: 1,
        },
      };
    }

    if (url.startsWith("classes/dropdown")) {
      return { data: { data: mockClassesList } };
    }

    if (url.match(/^classes\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("classes/")[1];
      const found =
        mockClassesList.find((c) => String(c.id) === String(id) || String(c._id) === String(id)) ||
        mockClassesList[0];
      return { data: { data: found } };
    }

    if (url.startsWith("classes")) {
      return { data: { data: mockClassesList } };
    }

    if (url.startsWith("fees/student/")) {
      const studentId = url.split("fees/student/")[1];
      const studentFees = mockFeesList.filter((f) => String(f.studentId?.id) === String(studentId));
      return { data: { data: studentFees } };
    }

    if (url.startsWith("fees")) {
      let filtered = [...mockFeesList];
      if (params.status) {
        filtered = filtered.filter((f) => f.status?.toLowerCase() === params.status.toLowerCase());
      }
      if (params.month) {
        filtered = filtered.filter((f) => f.month?.toLowerCase() === params.month.toLowerCase());
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter((f) =>
          (f.studentId?.name || "").toLowerCase().includes(q),
        );
      }
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const paged = filtered.slice((page - 1) * limit, page * limit);
      return {
        data: {
          data: paged,
          total,
          pagination: { page, pages, total },
        },
      };
    }

    if (url.startsWith("results/student/")) {
      const studentId = url.split("results/student/")[1];
      const list = mockResultsList.filter((r) => String(r.studentId?.id) === String(studentId));
      return { data: { data: list } };
    }

    if (url.match(/^results\/[a-zA-Z0-9_-]+$/)) {
      const id = url.split("results/")[1];
      const found = mockResultsList.find((r) => String(r.id) === String(id));
      return { data: { data: found || mockResultsList[0] } };
    }

    if (url.startsWith("results")) {
      let filtered = [...mockResultsList];
      if (params.class) {
        filtered = filtered.filter((r) => String(r.class) === String(params.class));
      }
      if (params.section) {
        filtered = filtered.filter((r) => String(r.section) === String(params.section));
      }
      if (params.academicYear) {
        filtered = filtered.filter((r) => String(r.academicYear) === String(params.academicYear));
      }
      return { data: { data: filtered, total: filtered.length } };
    }

    if (url.startsWith("profile")) {
      return { data: mockProfile };
    }
  }

  // --- MUTATION HANDLERS (POST / PUT / PATCH / DELETE) ---
  if (url.includes("auth/login") || url.includes("auth/signup")) {
    const user = {
      ...mockProfile,
      ...(body || {}),
      role: body?.role || "Super Admin",
      profile: {
        name:
          `${body?.firstName || mockProfile.firstName} ${body?.lastName || mockProfile.lastName}`.trim(),
      },
    };
    return {
      data: {
        user,
        token: "demo-token-" + Date.now(),
      },
    };
  }

  if (url.startsWith("profile") && method === "POST") {
    mockProfile = { ...mockProfile, ...body };
    return { data: mockProfile };
  }

  // Classes CRUD
  if (url === "classes" && method === "POST") {
    const newId = `c${Date.now()}`;
    const newClass = {
      _id: newId,
      id: newId,
      name: body.name || "New",
      displayOrder: body.displayOrder ?? mockClassesList.length + 1,
      isActive: body.isActive ?? true,
      sections: body.sections || ["A", "B"],
      subjects: body.subjects || [],
      studentCount: 0,
    };
    mockClassesList = [...mockClassesList, newClass];
    return { data: { data: newClass } };
  }

  if (url.match(/^classes\/[a-zA-Z0-9_-]+$/) && method === "PUT") {
    const id = url.split("classes/")[1];
    mockClassesList = mockClassesList.map((c) =>
      String(c.id) === String(id) || String(c._id) === String(id) ? { ...c, ...body } : c,
    );
    const updated = mockClassesList.find(
      (c) => String(c.id) === String(id) || String(c._id) === String(id),
    );
    return { data: { data: updated } };
  }

  if (url.match(/^classes\/[a-zA-Z0-9_-]+$/) && method === "DELETE") {
    const id = url.split("classes/")[1];
    mockClassesList = mockClassesList.filter(
      (c) => String(c.id) !== String(id) && String(c._id) !== String(id),
    );
    return { data: { success: true } };
  }

  // Students CRUD
  if (url === "students/admission" && method === "POST") {
    const newId = String(Date.now());
    const newStudent = {
      id: newId,
      _id: newId,
      ...body,
      name: body.fullName || body.name || "New Student",
      fullName: body.fullName || body.name || "New Student",
      contact: body.mobile || body.contact || "",
      status: body.is_active === false ? "Inactive" : "Active",
      is_active: body.is_active !== false,
      feeStatus: "Paid",
    };
    mockStudents = [newStudent, ...mockStudents];
    return { data: { student: newStudent } };
  }

  if (url.match(/^students\/[a-zA-Z0-9_-]+$/) && method === "PUT") {
    const id = url.split("students/")[1];
    mockStudents = mockStudents.map((s) =>
      String(s.id) === String(id) || String(s._id) === String(id)
        ? {
            ...s,
            ...body,
            name: body.fullName || body.name || s.name,
            fullName: body.fullName || body.name || s.fullName,
            contact: body.mobile || body.contact || s.contact,
            status: body.is_active === false ? "Inactive" : "Active",
          }
        : s,
    );
    const updated = mockStudents.find(
      (s) => String(s.id) === String(id) || String(s._id) === String(id),
    );
    return { data: { student: updated } };
  }

  if (url.match(/^students\/[a-zA-Z0-9_-]+$/) && method === "DELETE") {
    const id = url.split("students/")[1];
    mockStudents = mockStudents.filter(
      (s) => String(s.id) !== String(id) && String(s._id) !== String(id),
    );
    return { data: { success: true } };
  }

  // Fees CRUD
  if (url === "fees" && method === "POST") {
    const newId = `f${Date.now()}`;
    const newFee = {
      id: newId,
      _id: newId,
      studentId: getStudentRef(body.studentId),
      month: body.month,
      amount: Number(body.amount) || 0,
      paymentDate: body.paymentDate || new Date().toISOString().split("T")[0],
      paymentMethod: body.paymentMethod || "Cash",
      status: body.status || "Paid",
      remarks: body.remarks || "",
    };
    mockFeesList = [newFee, ...mockFeesList];
    return { data: { data: newFee } };
  }

  if (url.match(/^fees\/[a-zA-Z0-9_-]+$/) && method === "PUT") {
    const id = url.split("fees/")[1];
    mockFeesList = mockFeesList.map((f) =>
      String(f.id) === String(id) ? { ...f, ...body } : f,
    );
    const updated = mockFeesList.find((f) => String(f.id) === String(id));
    return { data: { data: updated } };
  }

  if (url.match(/^fees\/[a-zA-Z0-9_-]+$/) && method === "DELETE") {
    const id = url.split("fees/")[1];
    mockFeesList = mockFeesList.filter((f) => String(f.id) !== String(id));
    return { data: { success: true } };
  }

  // Results CRUD
  if (url === "results" && method === "POST") {
    const newId = `r${Date.now()}`;
    const computedTerms = {};
    Object.entries(body.terms || {}).forEach(([termName, termData]) => {
      computedTerms[termName] = computeTermMetrics(termData.subjects || [], termData.remarks || "", 1);
    });
    const studentRef = getStudentRef(body.studentId);
    const newResult = {
      id: newId,
      _id: newId,
      studentId: studentRef,
      class: body.class || studentRef.class,
      section: body.section || studentRef.section,
      rollNo: body.rollNo || studentRef.rollNo,
      academicYear: body.academicYear || "2026-2027",
      promotionStatus: body.promotionStatus || "Pending",
      terms: computedTerms,
    };
    mockResultsList = [newResult, ...mockResultsList];
    return { data: { data: newResult } };
  }

  if (url.match(/^results\/[a-zA-Z0-9_-]+$/) && method === "PUT") {
    const id = url.split("results/")[1];
    mockResultsList = mockResultsList.map((r) => {
      if (String(r.id) !== String(id)) return r;
      const updatedTerms = { ...(r.terms || {}) };
      Object.entries(body.terms || {}).forEach(([termName, termData]) => {
        updatedTerms[termName] = computeTermMetrics(termData.subjects || [], termData.remarks || "", 1);
      });
      return {
        ...r,
        academicYear: body.academicYear || r.academicYear,
        rollNo: body.rollNo ?? r.rollNo,
        promotionStatus: body.promotionStatus || r.promotionStatus,
        terms: updatedTerms,
      };
    });
    const updated = mockResultsList.find((r) => String(r.id) === String(id));
    return { data: { data: updated } };
  }

  if (url.match(/^results\/[a-zA-Z0-9_-]+\/terms\/.+$/) && method === "DELETE") {
    const [, id, , rawTermName] = url.split("/");
    const termName = decodeURIComponent(rawTermName);
    mockResultsList = mockResultsList.map((r) => {
      if (String(r.id) !== String(id)) return r;
      const nextTerms = { ...(r.terms || {}) };
      delete nextTerms[termName];
      return { ...r, terms: nextTerms };
    });
    return { data: { success: true } };
  }

  if (url.match(/^results\/[a-zA-Z0-9_-]+$/) && method === "DELETE") {
    const id = url.split("results/")[1];
    mockResultsList = mockResultsList.filter((r) => String(r.id) !== String(id));
    return { data: { success: true } };
  }

  return {
    data: {
      success: true,
      message: "Completed with mock data",
      data: body || {},
    },
  };
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
  ],
  endpoints: () => ({}),
});
