import { baseApi } from "../index";

export const classRoutineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/class-routines
    getClassRoutines: builder.query({
      query: (params) => ({
        url: "class-routines",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "ClassRoutine", id })),
              { type: "ClassRoutine", id: "LIST" },
            ]
          : [{ type: "ClassRoutine", id: "LIST" }],
    }),
    // POST /api/class-routines
    createClassRoutine: builder.mutation({
      query: (body) => ({
        url: "class-routines",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ClassRoutine", id: "LIST" }],
    }),
    // PUT /api/class-routines/:id
    updateClassRoutine: builder.mutation({
      query: ({ id, body }) => ({
        url: `class-routines/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClassRoutine", id },
        { type: "ClassRoutine", id: "LIST" },
      ],
    }),
    // DELETE /api/class-routines/:id
    deleteClassRoutine: builder.mutation({
      query: (id) => ({
        url: `class-routines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClassRoutine", id },
        { type: "ClassRoutine", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClassRoutinesQuery,
  useCreateClassRoutineMutation,
  useUpdateClassRoutineMutation,
  useDeleteClassRoutineMutation,
} = classRoutineApi;
