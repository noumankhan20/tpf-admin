import { apiSlice } from "./apiSlice";

export const jobApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 Create Job (Admin)
    createJob: builder.mutation({
      query: (data) => ({
        url: "/jobs/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Jobs"],
    }),

    // 🔹 Get All Jobs (Public/Admin)
    getAllJobs: builder.query({
      query: (params) => ({
        url: "/jobs/getall",
        params,
      }),
      providesTags: ["Jobs"],
    }),

    // 🔹 Update Job (Admin)
    updateJob: builder.mutation({
      query: ({ id, data }) => ({
        url: `/jobs/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Jobs"],
    }),

    // 🔹 Delete Job (Admin)
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/jobs/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Jobs"],
    }),

  }),
});

export const {
  useCreateJobMutation,
  useGetAllJobsQuery,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobApiSlice;