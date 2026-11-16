import { baseApi } from "@/services";

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryFolders: builder.query({
      query: (params = {}) => ({
        url: "library/folders/",
        params,
      }),
      providesTags: ["LibraryFolder"],
    }),
    createLibraryFolder: builder.mutation({
      query: (body) => ({
        url: "library/folders/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LibraryFolder"],
    }),
    updateLibraryFolder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `library/folders/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["LibraryFolder", "LibraryItem"],
    }),
    deleteLibraryFolder: builder.mutation({
      query: (id) => ({
        url: `library/folders/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["LibraryFolder", "LibraryItem"],
    }),
    getLibraryItems: builder.query({
      query: (params = {}) => ({
        url: "library/items/",
        params,
      }),
      providesTags: ["LibraryItem"],
    }),
    createLibraryItem: builder.mutation({
      query: (body) => ({
        url: "library/items/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LibraryItem", "LibraryFolder"],
    }),
    updateLibraryItem: builder.mutation({
      query: ({ id, data }) => ({
        url: `library/items/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["LibraryItem", "LibraryFolder"],
    }),
    deleteLibraryItem: builder.mutation({
      query: (id) => ({
        url: `library/items/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["LibraryItem", "LibraryFolder"],
    }),
    trackLibraryDownload: builder.mutation({
      query: (id) => ({
        url: `library/items/${id}/download/`,
        method: "POST",
      }),
      invalidatesTags: ["LibraryItem"],
    }),
  }),
});

export const {
  useGetLibraryFoldersQuery,
  useCreateLibraryFolderMutation,
  useUpdateLibraryFolderMutation,
  useDeleteLibraryFolderMutation,
  useGetLibraryItemsQuery,
  useCreateLibraryItemMutation,
  useUpdateLibraryItemMutation,
  useDeleteLibraryItemMutation,
  useTrackLibraryDownloadMutation,
} = libraryApi;
