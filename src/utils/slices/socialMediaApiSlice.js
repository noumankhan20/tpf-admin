import { apiSlice } from "./apiSlice";

export const socialMediaApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSocialAssignments: builder.query({
            query: () => '/social-media/social-assignments',
            providesTags: ["SocialMediaAssignments"],
        }),
        submitSocialLinks: builder.mutation({
            query: (data) => ({
                url: '/social-media/submit-social-links',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ["SocialMediaAssignments"],
        }),
        completeSocialTask: builder.mutation({
            query: ({ taskId, campaignData }) => ({
                url: `/workflow/tasks/${taskId}/complete`,
                method: 'POST',
                body: campaignData, // Pass the social links or other data if needed
            }),
            invalidatesTags: ["SocialMediaAssignments"],
        }),
    }),
});

export const {
    useGetSocialAssignmentsQuery,
    useSubmitSocialLinksMutation,
    useCompleteSocialTaskMutation,
} = socialMediaApiSlice;
