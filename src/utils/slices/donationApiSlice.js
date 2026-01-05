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

    })
})


export const {
    useGetDonationsQuery,
    useGetOfflineDonationsQuery,
    useApproveOfflineDonationsMutation,
    useGetAllDonorsQuery,
    useGetDonorDetailsQuery
} = donationApiSlice