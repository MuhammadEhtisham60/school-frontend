import { baseApi } from "../index";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: "auth/change-password",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
    resendOtp: builder.mutation({
      query: (email) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, password, confirmPassword }) => ({
        url: "auth/reset-password",
        method: "POST",
        body: { email, otp, password, confirmPassword },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutUserMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
} = authApi;
