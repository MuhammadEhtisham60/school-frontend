import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { mockBaseQuery } from "./mockFallback";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:8000/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithFallback = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (
    result.error &&
    (result.error.status === "FETCH_ERROR" ||
      result.error.status === "PARSING_ERROR" ||
      (typeof result.error.status === "number" && result.error.status >= 500) ||
      (typeof result.error.originalStatus === "number" && result.error.originalStatus >= 500))
  ) {
    return mockBaseQuery(args, api, extraOptions);
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithFallback,
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
  ],
  endpoints: () => ({}),
});
