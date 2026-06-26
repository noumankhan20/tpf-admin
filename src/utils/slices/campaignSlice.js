import { apiSlice } from "./apiSlice";  // Importing the base API slice

// Creating a slice for the Campaigns API endpoints
export const campaignApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch campaigns with pagination
    fetchCampaigns: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();

        // Always include these
        searchParams.set('page', params.page ?? 1);
        searchParams.set('limit', params.limit ?? 50);
        if (params.search) searchParams.set('search', params.search);

        // Append all filter keys if they have a value
        const filterKeys = [
          'isActive', 'campaignStatus', 'category',
          'isUrgent', 'zakatVerified', 'taxBenefits',
          'deadline', 'minAmount', 'maxAmount',
          'minRaised', 'maxRaised', 'source', 'isSpecialCase'
        ];

        filterKeys.forEach((key) => {
          if (params[key] !== undefined && params[key] !== '') {
            searchParams.set(key, params[key]);
          }
        });

        return `campaigns/get?${searchParams.toString()}`;
      },
      keepUnusedDataFor: 0,
      providesTags: ['Campaigns'],
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
