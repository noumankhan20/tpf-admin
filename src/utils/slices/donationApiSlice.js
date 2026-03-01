import { apiSlice } from "./apiSlice";

export const donationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDonations: builder.query({
      query: (params) => ({
        url: 'donations/get', // Your backend endpoint
        method: 'GET',
        params: params, // Pass filters and pagination params
      }),
    }),

    getOfflineDonations: builder.query({
      query: (params) => ({
        url: 'offline-donations/get',
        method: 'GET',
        params: params,
      })
    }),

    approveOfflineDonations: builder.mutation({
      query: ({ donationId }) => ({
        url: "offline-donations/approve",
        method: "POST",
        body: { donationId }, // Send the array of donation IDs to approve
      }),
    }),

    getAllDonors: builder.query({
      query: (params) => ({
        url: 'donations/getall', // Your backend endpoint
        method: 'GET',
        params: params, // Pass filters and pagination params
      }),
      // Optional: Use transformResponse to modify the response data if necessary
      transformResponse: (response) => {
        // For example, you can reformat or add computed fields here
        return response;
      },
    }),

    // Fetch a single donor's detailed information (including donation history)
    getDonorDetails: builder.query({
      query: (id) => ({
        url: `/donations/donor/${id}`, // Your backend endpoint for individual donor details
        method: 'GET',
      }),
    }),

    getPendingCount: builder.query({
      query: () => ({
        url: `offline-donations/pending-count`, // Your backend endpoint for individual donor details
        method: 'GET',
      }),
    }),

    rejectOfflineDonations: builder.mutation({
      query: ({ donationId, remarks }) => ({
        url: "offline-donations/reject",
        method: "POST",
        body: { donationId, remarks }, // Send the array of donation IDs to reject
      }),
    }),
    createOfflineDonationByAdmin: builder.mutation({
      query: (data) => ({
        url: "offline-donations/admin-create",
        method: "POST",
        body: data,
      }),

      // 🔥 optional but recommended
      invalidatesTags: ["OfflineDonations", "PendingCount"],
    }),
    getCampaignDropdown: builder.query({
      query: () => ({
        url: "offline-donations/campaign-dropdown",
        method: "GET",
      }),
    }),

  })
})


export const {
  useGetDonationsQuery,
  useGetOfflineDonationsQuery,
  useApproveOfflineDonationsMutation,
  useGetAllDonorsQuery,
  useGetDonorDetailsQuery,
  useGetPendingCountQuery,
  useRejectOfflineDonationsMutation,
  useCreateOfflineDonationByAdminMutation,
  useGetCampaignDropdownQuery,
} = donationApiSlice