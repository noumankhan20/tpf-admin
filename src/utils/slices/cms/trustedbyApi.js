import { apiSlice } from "../apiSlice";

export const trustedByApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL TRUSTED BY
    getTrustedBy: builder.query({
      query: () => "/cms/trusted-by/get",
      providesTags: ["TrustedBy"],
    }),

    // 🔹 CREATE TRUSTED BY
    createTrustedBy: builder.mutation({
      query: (formData) => ({
        url: "/cms/trusted-by/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["TrustedBy"],
    }),

    // 🔹 UPDATE TRUSTED BY
    updateTrustedBy: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/trusted-by/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["TrustedBy"],
    }),

    // 🔹 DELETE TRUSTED BY
    deleteTrustedBy: builder.mutation({
      query: (id) => ({
        url: `/cms/trusted-by/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TrustedBy"],
    }),

  }),
});

export const {
  useGetTrustedByQuery,
  useCreateTrustedByMutation,
  useUpdateTrustedByMutation,
  useDeleteTrustedByMutation,
} = trustedByApi;
