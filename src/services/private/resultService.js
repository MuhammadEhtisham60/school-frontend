import { baseApi } from "../index";

export const resultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/results?academicYear=...&class=...&section=...&studentId=...&term=...
    getResults: builder.query({
      query: (params) => ({
        url: "results",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Result", id })),
              { type: "Result", id: "LIST" },
            ]
          : [{ type: "Result", id: "LIST" }],
    }),

    // GET /api/results/:id
    getResultDetails: builder.query({
      query: (id) => ({
        url: `results/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Result", id }],
    }),

    // GET /api/results/student/:studentId
    getStudentHistory: builder.query({
      query: (studentId) => ({
        url: `results/student/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // POST /api/results
    createResult: builder.mutation({
      query: (body) => ({
        url: "results",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Result", id: "LIST" },
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // PUT /api/results/:id
    updateResult: builder.mutation({
      query: ({ id, body }) => ({
        url: `results/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, studentId }) => [
        { type: "Result", id },
        { type: "Result", id: "LIST" },
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // DELETE /api/results/:id
    deleteResult: builder.mutation({
      query: ({ id, studentId }) => ({
        url: `results/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Result", id: "LIST" },
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // DELETE /api/results/:id/terms/:termName
    deleteTermResult: builder.mutation({
      query: ({ id, termName }) => ({
        url: `results/${id}/terms/${termName}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Result", id },
        { type: "Result", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetResultsQuery,
  useGetResultDetailsQuery,
  useGetStudentHistoryQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useDeleteTermResultMutation,
} = resultApi;
