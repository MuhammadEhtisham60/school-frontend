import { baseApi } from "../index";

export const resourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // EVENT CALENDAR
    // ==========================================
    getEvents: builder.query({
      query: (params) => ({
        url: "events",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "SchoolEvent", id })),
              { type: "SchoolEvent", id: "LIST" },
            ]
          : [{ type: "SchoolEvent", id: "LIST" }],
    }),
    getEventById: builder.query({
      query: (id) => ({
        url: `events/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "SchoolEvent", id }],
    }),
    createEvent: builder.mutation({
      query: (body) => ({
        url: "events",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SchoolEvent", id: "LIST" }],
    }),
    updateEvent: builder.mutation({
      query: ({ id, body }) => ({
        url: `events/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SchoolEvent", id },
        { type: "SchoolEvent", id: "LIST" },
      ],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SchoolEvent", id },
        { type: "SchoolEvent", id: "LIST" },
      ],
    }),

    // ==========================================
    // NOTICE BOARD
    // ==========================================
    getNotices: builder.query({
      query: (params) => ({
        url: "notices",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Notice", id })),
              { type: "Notice", id: "LIST" },
            ]
          : [{ type: "Notice", id: "LIST" }],
    }),
    getNoticeById: builder.query({
      query: (id) => ({
        url: `notices/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Notice", id }],
    }),
    createNotice: builder.mutation({
      query: (body) => ({
        url: "notices",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Notice", id: "LIST" }],
    }),
    updateNotice: builder.mutation({
      query: ({ id, body }) => ({
        url: `notices/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Notice", id },
        { type: "Notice", id: "LIST" },
      ],
    }),
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `notices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notice", id },
        { type: "Notice", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = resourceApi;

