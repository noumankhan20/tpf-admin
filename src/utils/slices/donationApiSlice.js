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
    })
})


export const {
    useGetDonationsQuery,
} = donationApiSlice