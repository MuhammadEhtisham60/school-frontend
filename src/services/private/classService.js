import { baseApi } from "../index";

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/classes
    getClasses: builder.query({
      query: () => ({
        url: "classes",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Class", id })),
              { type: "Class", id: "LIST" },
            ]
          : [{ type: "Class", id: "LIST" }],
    }),
    // GET /api/classes/dropdown
    getClassesDropdown: builder.query({
      query: () => ({
        url: "classes/dropdown",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Class", id: `DROPDOWN_${_id}` })),
              { type: "Class", id: "DROPDOWN" },
            ]
          : [{ type: "Class", id: "DROPDOWN" }],
    }),
    // GET /api/classes/:id
    getClassById: builder.query({
      query: (id) => ({
        url: `classes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Class", id }],
    }),
    // POST /api/classes
    createClass: builder.mutation({
      query: (body) => ({
        url: "classes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Class", id: "LIST" }, { type: "Class", id: "DROPDOWN" }],
    }),
    // PUT /api/classes/:id
    updateClass: builder.mutation({
      query: ({ id, body }) => ({
        url: `classes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Class", id },
        { type: "Class", id: "LIST" },
        { type: "Class", id: "DROPDOWN" },
      ],
    }),
    // DELETE /api/classes/:id
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Class", id },
        { type: "Class", id: "LIST" },
        { type: "Class", id: "DROPDOWN" },
      ],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassesDropdownQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;
