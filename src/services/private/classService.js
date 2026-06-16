import { baseApi } from "../index";

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/classes/dropdown
    getClassesDropdown: builder.query({
      query: () => ({
        url: "classes/dropdown",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Class", id: _id })),
              { type: "Class", id: "DROPDOWN" },
            ]
          : [{ type: "Class", id: "DROPDOWN" }],
    }),
  }),
});

export const { useGetClassesDropdownQuery } = classApi;
