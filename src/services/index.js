import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, isTokenValid } from "@/store/slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:8000/api/",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token || localStorage.getItem("token");
    if (token && isTokenValid(token)) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args?.url || "";
  const isLoginRequest = url.includes("auth/login");

  if (!isLoginRequest) {
    const token = api.getState()?.auth?.token || localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      api.dispatch(logout());
      return {
        error: {
          status: 401,
          data: { message: "Authentication required. Please sign in." },
        },
      };
    }
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && !isLoginRequest) {
    api.dispatch(logout());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Student",
    "StudentFees",
    "Fee",
    "StudentFeesList",
    "Result",
    "StudentResultHistory",
    "Class",
    "Teacher",
    "TeacherSalary",
    "TeacherLeave",
    "TeacherAttendance",
    "SchoolEvent",
    "Notice",
    "QuestionPaper",
    "Subject",
    "ClassRoutine",
    "Exam",
    "StudentAttendance",
  ],
  endpoints: () => ({}),
});
