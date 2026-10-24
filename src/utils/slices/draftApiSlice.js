import { apiSlice } from './apiSlice';

// Per-admin drafts stored in the database (keyed by admin) with their files in Wasabi,
// so a draft follows the admin across sessions and devices.
export const draftApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDraft: builder.query({
      query: (key) => `/admin-drafts/${key}`,
      transformResponse: (res) => res?.data ?? null,
      keepUnusedDataFor: 0,
    }),
    saveAdminDraft: builder.mutation({
      query: ({ key, formData, files }) => ({
        url: `/admin-drafts/${key}`,
        method: 'PUT',
        body: { formData, files },
      }),
    }),
    uploadAdminDraftFiles: builder.mutation({
      // body is a FormData with one or more "files" parts
      query: ({ key, body }) => ({ url: `/admin-drafts/${key}/files`, method: 'POST', body }),
    }),
    deleteAdminDraft: builder.mutation({
      query: (key) => ({ url: `/admin-drafts/${key}`, method: 'DELETE' }),
    }),
  }),
});

export const {
  useGetAdminDraftQuery,
  useSaveAdminDraftMutation,
  useUploadAdminDraftFilesMutation,
  useDeleteAdminDraftMutation,
} = draftApiSlice;
