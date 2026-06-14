import { baseApi } from "../index";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "profile",
        method: "POST",
        body: profileData,
      }),
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
