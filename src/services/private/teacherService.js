import { baseApi } from "../index";

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/teachers
    getTeachers: builder.query({
      query: (params) => ({
        url: "teachers",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.teachers
          ? [
              ...result.teachers.map(({ id }) => ({ type: "Teacher", id })),
              { type: "Teacher", id: "LIST" },
            ]
          : [{ type: "Teacher", id: "LIST" }],
    }),
    // GET /api/teachers/dropdown
    getTeachersDropdown: builder.query({
      query: () => ({
        url: "teachers/dropdown",
        method: "GET",
      }),
      providesTags: [{ type: "Teacher", id: "DROPDOWN" }],
    }),
    // GET /api/teachers/next-employee-id
    getNextEmployeeId: builder.query({
      query: () => ({
        url: "teachers/next-employee-id",
        method: "GET",
      }),
      providesTags: [{ type: "Teacher", id: "LIST" }],
      keepUnusedDataFor: 0,
    }),
    // GET /api/teachers/:id
    getTeacher: builder.query({
      query: (id) => ({
        url: `teachers/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Teacher", id }],
    }),
    // POST /api/teachers
    createTeacher: builder.mutation({
      query: (body) => ({
        url: "teachers",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Teacher", id: "LIST" },
        { type: "Teacher", id: "DROPDOWN" },
        { type: "Class", id: "LIST" },
        { type: "TeacherSalary", id: "LIST" },
      ],
    }),
    // PUT /api/teachers/:id
    updateTeacher: builder.mutation({
      query: ({ id, body }) => ({
        url: `teachers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teacher", id },
        { type: "Teacher", id: "LIST" },
        { type: "Teacher", id: "DROPDOWN" },
        { type: "Class", id: "LIST" },
      ],
    }),
    // DELETE /api/teachers/:id
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `teachers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Teacher", id },
        { type: "Teacher", id: "LIST" },
        { type: "Teacher", id: "DROPDOWN" },
        { type: "Class", id: "LIST" },
        { type: "TeacherSalary", id: "LIST" },
      ],
    }),

    // ==========================================
    // TEACHER SALARIES / PAYROLL
    // ==========================================
    getAllTeacherSalaries: builder.query({
      query: (params) => ({
        url: "teacher-salaries",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "TeacherSalary", id })),
              { type: "TeacherSalary", id: "LIST" },
            ]
          : [{ type: "TeacherSalary", id: "LIST" }],
    }),
    getTeacherSalaries: builder.query({
      query: (teacherId) => ({
        url: `teachers/${teacherId}/salaries`,
        method: "GET",
      }),
      providesTags: (result, error, teacherId) => [
        { type: "TeacherSalary", id: `TEACHER_${teacherId}` },
        { type: "TeacherSalary", id: "LIST" },
      ],
    }),
    createTeacherSalary: builder.mutation({
      query: (body) => ({
        url: "teacher-salaries",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { teacherId }) => [
        { type: "TeacherSalary", id: `TEACHER_${teacherId}` },
        { type: "TeacherSalary", id: "LIST" },
        { type: "Teacher", id: teacherId },
        { type: "Teacher", id: "LIST" },
      ],
    }),
    updateTeacherSalary: builder.mutation({
      query: ({ id, body, teacherId }) => ({
        url: `teacher-salaries/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, teacherId }) => [
        { type: "TeacherSalary", id },
        { type: "TeacherSalary", id: `TEACHER_${teacherId}` },
        { type: "TeacherSalary", id: "LIST" },
        { type: "Teacher", id: teacherId },
        { type: "Teacher", id: "LIST" },
      ],
    }),
    deleteTeacherSalary: builder.mutation({
      query: ({ id }) => ({
        url: `teacher-salaries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id, teacherId }) => [
        { type: "TeacherSalary", id },
        { type: "TeacherSalary", id: `TEACHER_${teacherId}` },
        { type: "TeacherSalary", id: "LIST" },
        { type: "Teacher", id: teacherId },
        { type: "Teacher", id: "LIST" },
      ],
    }),

    // ==========================================
    // TEACHER LEAVES
    // ==========================================
    getTeacherLeaves: builder.query({
      query: (params) => ({
        url: "teacher-leaves",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "TeacherLeave", id: "LIST" }],
    }),
    createTeacherLeave: builder.mutation({
      query: (body) => ({
        url: "teacher-leaves",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "TeacherLeave", id: "LIST" },
        { type: "Teacher", id: "LIST" },
      ],
    }),
    updateTeacherLeave: builder.mutation({
      query: ({ id, body }) => ({
        url: `teacher-leaves/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "TeacherLeave", id: "LIST" },
        { type: "Teacher", id: "LIST" },
      ],
    }),
    deleteTeacherLeave: builder.mutation({
      query: (id) => ({
        url: `teacher-leaves/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "TeacherLeave", id: "LIST" }],
    }),

    // ==========================================
    // TEACHER ATTENDANCE
    // ==========================================
    getTeacherAttendance: builder.query({
      query: (params) => ({
        url: "teacher-attendance",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "TeacherAttendance", id: "LIST" }],
    }),
    saveTeacherAttendance: builder.mutation({
      query: (body) => ({
        url: "teacher-attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TeacherAttendance", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeachersDropdownQuery,
  useGetNextEmployeeIdQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetAllTeacherSalariesQuery,
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
} = teacherApi;

