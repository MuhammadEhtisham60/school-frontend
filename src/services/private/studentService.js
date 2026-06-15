import { baseApi } from "../index";

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: (params) => ({
        url: "students",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.students
          ? [
              ...result.students.map(({ id }) => ({ type: "Student", id })),
              { type: "Student", id: "LIST" },
            ]
          : [{ type: "Student", id: "LIST" }],
    }),
    getStudent: builder.query({
      query: (id) => ({
        url: `students/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Student", id }],
    }),
    createStudent: builder.mutation({
      query: (formData) => ({
        url: "students/admission",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),
    updateStudent: builder.mutation({
      query: ({ id, formData }) => ({
        url: `students/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Student", id },
        { type: "Student", id: "LIST" },
      ],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Student", id },
        { type: "Student", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;
