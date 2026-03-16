import { apiSlice } from "./apiSlice";  // Importing the base API slice

// Creating a slice for the Campaigns API endpoints
export const campaignApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch campaigns with pagination
    fetchCampaigns: builder.query({
      query: ({ page = 1, limit = 50, search = '' }) => `campaigns/get?page=${page}&limit=${limit}&search=${search}`,
      keepUnusedDataFor: 0,
      providesTags: ['Campaigns'], // This will allow cache management for campaigns
    }),
    getCampaignList: builder.query({
      query: () => 'campaigns/list',
      providesTags: ['Campaigns'],
    }),
    fetchCampaignById: builder.query({
      query: (id) => `campaigns/getcampaignlist/${id}`, // <-- match your backend route
      providesTags: (result, error, id) => [{ type: 'Campaigns', id }],
    }),
  }),
});

export const {
  useFetchCampaignsQuery,   // The hook for fetching campaigns
  useGetCampaignListQuery,
  useFetchCampaignByIdQuery,
} = campaignApiSlice;
