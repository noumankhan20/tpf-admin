import { apiSlice } from "../apiSlice";

export const tailoredApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL TAILORED
    getTailored: builder.query({
      query: () => "/cms/tailored/get",
      providesTags: ["Tailored"],
    }),

    // 🔹 CREATE TAILORED
    createTailored: builder.mutation({
      query: (formData) => ({
        url: "/cms/tailored/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Tailored"],
    }),

    // 🔹 UPDATE TAILORED
    updateTailored: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/tailored/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Tailored"],
    }),

    // 🔹 DELETE TAILORED
    deleteTailored: builder.mutation({
      query: (id) => ({
        url: `/cms/tailored/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tailored"],
    }),

  }),
});

export const {
  useGetTailoredQuery,
  useCreateTailoredMutation,
  useUpdateTailoredMutation,
  useDeleteTailoredMutation,
} = tailoredApi;
