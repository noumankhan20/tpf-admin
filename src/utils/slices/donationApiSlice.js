import { apiSlice } from "./apiSlice";

export const donationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) =>({
        getDonations: builder.query({
      query: (params) => ({
        url: 'donations/get', // Your backend endpoint
        method: 'GET',
        params: params, // Pass filters and pagination params
      }),
    }),

      getOfflineDonations: builder.query({
        query:(params) =>({
          url:'offline-donations/get',
          method:'GET',
          params: params,
        })
      }),

      approveOfflineDonations: builder.mutation({
      query: ({donationId}) => ({
        url: "offline-donations/approve",
        method: "POST",
        body: { donationId }, // Send the array of donation IDs to approve
      }),
    }),

    })
})


export const {
    useGetDonationsQuery,
    useGetOfflineDonationsQuery,
    useApproveOfflineDonationsMutation,
} = donationApiSlice