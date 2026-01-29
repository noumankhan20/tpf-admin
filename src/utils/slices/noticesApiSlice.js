import { apiSlice } from "./apiSlice";

export const noticesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // =========================
    // CREATE NOTICE (Admin)
    // =========================
    createNotice: builder.mutation({
      query: (data) => ({
        url: "/notices/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notices"],
    }),

    // =========================
    // GET ALL NOTICES (Admin)
    // =========================
    getAllNotices: builder.query({
      query: (category) => ({
        url: "/notices/get",
        params: category ? { category } : {},
      }),
      providesTags: ["Notices"],
    }),

    // =========================
    // GET SINGLE NOTICE
    // =========================
    getNoticeById: builder.query({
      query: (id) => `/notices/${id}/get`,
      providesTags: (result, error, id) => [
        { type: "Notices", id },
      ],
    }),

    // =========================
    // UPDATE NOTICE
    // =========================
    updateNotice: builder.mutation({
      query: ({ id, data }) => ({
        url: `/notices/${id}/update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Notices"],
    }),

    // =========================
    // DELETE NOTICE
    // =========================
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notices"],
    }),

  }),
});

export const {
  useCreateNoticeMutation,
  useGetAllNoticesQuery,
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = noticesApiSlice;
