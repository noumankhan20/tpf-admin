import { apiSlice } from "./apiSlice";

export const cmsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get CMS tasks assigned to the logged-in admin
        getCMSTasks: builder.query({
            query: () => '/cms/tasks',
            providesTags: ["CMSTasks"],
        }),

        // Get completed CMS tasks
        getCompletedCMSTasks: builder.query({
            query: () => '/cms/tasks/completed',
            providesTags: ["CompletedCMSTasks"],
        }),

        // Get photography submissions for a specific campaign
        getPhotographySubmissions: builder.query({
            query: (campaignId) => `/cms/campaigns/${campaignId}/photography`,
            providesTags: (result, error, campaignId) => [
                { type: "PhotographySubmissions", id: campaignId }
            ],
        }),

        // Publish campaign (complete CMS task)
        publishCampaign: builder.mutation({
            query: ({ taskId, campaignData }) => ({
                url: `/cms/tasks/${taskId}/publish`,
                method: "POST",
                body: campaignData,
            }),
            invalidatesTags: ["CMSTasks", "CompletedCMSTasks", "Campaigns"],
        }),
    }),
});

export const {
    useGetCMSTasksQuery,
    useGetCompletedCMSTasksQuery,
    useGetPhotographySubmissionsQuery,
    usePublishCampaignMutation,
} = cmsApiSlice;
