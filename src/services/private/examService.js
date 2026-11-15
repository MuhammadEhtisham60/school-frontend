import { baseApi } from "../index";

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/exams
    getExams: builder.query({
      query: (params) => ({
        url: "exams",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Exam", id })),
              { type: "Exam", id: "LIST" },
            ]
          : [{ type: "Exam", id: "LIST" }],
    }),
    // POST /api/exams
    createExam: builder.mutation({
      query: (body) => ({
        url: "exams",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Exam", id: "LIST" }],
    }),
    // PUT /api/exams/:id
    updateExam: builder.mutation({
      query: ({ id, body }) => ({
        url: `exams/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Exam", id },
        { type: "Exam", id: "LIST" },
      ],
    }),
    // DELETE /api/exams/:id
    deleteExam: builder.mutation({
      query: (id) => ({
        url: `exams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Exam", id },
        { type: "Exam", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
} = examApi;
