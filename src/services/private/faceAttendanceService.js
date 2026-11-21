import { baseApi } from "@/services";

export const faceAttendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaceProfiles: builder.query({
      query: () => ({
        url: "face-attendance/profiles/",
        method: "GET",
      }),
      providesTags: ["FaceAttendance"],
    }),
    enrollFace: builder.mutation({
      query: (body) => ({
        url: "face-attendance/enroll/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FaceAttendance", { type: "Student", id: "LIST" }],
    }),
    clearFaceEnrollment: builder.mutation({
      query: ({ personType, personId }) => ({
        url: `face-attendance/enroll/?personType=${encodeURIComponent(personType)}&personId=${encodeURIComponent(personId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FaceAttendance"],
    }),
    markFaceAttendance: builder.mutation({
      query: (body) => ({
        url: "face-attendance/mark/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FaceAttendance", { type: "StudentAttendance", id: "LIST" }],
    }),
    getFaceLogs: builder.query({
      query: (date) => ({
        url: "face-attendance/logs/",
        method: "GET",
        params: date ? { date } : {},
      }),
      providesTags: ["FaceAttendance"],
    }),
  }),
});

export const {
  useGetFaceProfilesQuery,
  useEnrollFaceMutation,
  useClearFaceEnrollmentMutation,
  useMarkFaceAttendanceMutation,
  useGetFaceLogsQuery,
} = faceAttendanceApi;
