import { apiSlice } from "./apiSlice";

export const photographyApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAssignments: builder.query({
            query: () => '/photography/assignments',
            providesTags: ["PhotographyAssignments"],
        }),
        getCompletedAssignments: builder.query({
            query: () => '/photography/assignments/completed',
            providesTags: ["PhotographyAssignments"],
        }),
        uploadPhotography: builder.mutation({
            query: ({ formData, campaignId }) => {
                // The user specified campaignId should be in URL Query Params
                const params = new URLSearchParams();
                if (campaignId) params.append("campaignId", campaignId);

                return {
                    url: `/photography/upload?${params.toString()}`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["PhotographyAssignments"],
        }),
        completeTask: builder.mutation({
            query: ({ taskId }) => ({
                url: `/workflow/tasks/${taskId}/complete`,
                method: "POST",
            }),
            invalidatesTags: ["PhotographyAssignments"],
        }),
    }),
});

export const {
    useGetAssignmentsQuery,
    useGetCompletedAssignmentsQuery,
    useUploadPhotographyMutation,
    useCompleteTaskMutation,
} = photographyApiSlice;
