import { baseApi } from "../index";

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/fees
    getFees: builder.query({
      query: (params) => ({
        url: "fees",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: "Fee", id })), { type: "Fee", id: "LIST" }]
          : [{ type: "Fee", id: "LIST" }],
    }),

    // GET /api/fees/student/:studentId
    getStudentFeesList: builder.query({
      query: (studentId) => ({
        url: `fees/student/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [{ type: "StudentFeesList", id: studentId }],
    }),

    // POST /api/fees
    createFee: builder.mutation({
      query: (body) => ({
        url: "fees",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Fee", id: "LIST" },
        { type: "StudentFeesList", id: studentId },
      ],
    }),

    // PUT /api/fees/:id
    updateFee: builder.mutation({
      query: ({ id, body }) => ({
        url: `fees/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, studentId }) => [
        { type: "Fee", id },
        { type: "Fee", id: "LIST" },
        { type: "StudentFeesList", id: studentId },
      ],
    }),

    // DELETE /api/fees/:id
    deleteFee: builder.mutation({
      query: ({ id, studentId }) => ({
        url: `fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Fee", id: "LIST" },
        { type: "StudentFeesList", id: studentId },
      ],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetStudentFeesListQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feeApi;
