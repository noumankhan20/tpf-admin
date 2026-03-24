import { apiSlice } from "./apiSlice";

export const deleteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 Get all delete requests (SuperAdmin)
    getAllDeleteRequests: builder.query({
      query: () => ({
        url: "/delete/getall",
        method: "GET",
      }),
      providesTags: ["DeleteRequests"],
    }),

    // 🔹 Create delete request (usually not needed manually)
    createDeleteRequest: builder.mutation({
      query: (data) => ({
        url: "/delete/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DeleteRequests"],
    }),

    // 🔹 Approve request
    approveDeleteRequest: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["DeleteRequests"],
    }),

    // 🔹 Reject request
    rejectDeleteRequest: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["DeleteRequests"],
    }),

  }),
});

export const {
  useGetAllDeleteRequestsQuery,
  useCreateDeleteRequestMutation,
  useApproveDeleteRequestMutation,
  useRejectDeleteRequestMutation,
} = deleteApiSlice;