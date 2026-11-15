import { baseApi } from "../index";

export const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/subjects
    getSubjects: builder.query({
      query: (params) => ({
        url: "subjects",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Subject", id })),
              { type: "Subject", id: "LIST" },
            ]
          : [{ type: "Subject", id: "LIST" }],
    }),
    // GET /api/subjects/:id
    getSubjectById: builder.query({
      query: (id) => ({
        url: `subjects/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Subject", id }],
    }),
    // POST /api/subjects
    createSubject: builder.mutation({
      query: (body) => ({
        url: "subjects",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Subject", id: "LIST" }],
    }),
    // PUT /api/subjects/:id
    updateSubject: builder.mutation({
      query: ({ id, body }) => ({
        url: `subjects/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subject", id },
        { type: "Subject", id: "LIST" },
      ],
    }),
    // DELETE /api/subjects/:id
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Subject", id },
        { type: "Subject", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;
