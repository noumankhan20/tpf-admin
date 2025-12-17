import { apiSlice } from "./apiSlice";  // Importing the base API slice

// Creating a slice for the Campaigns API endpoints
export const campaignApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch campaigns with pagination
    fetchCampaigns: builder.query({
      query: ({ page, limit }) => `campaigns/get?page=${page}&limit=${limit}`,
      providesTags: ['Campaigns'], // This will allow cache management for campaigns
    }),
  }),
});

export const {
  useFetchCampaignsQuery,   // The hook for fetching campaigns
} = campaignApiSlice;
