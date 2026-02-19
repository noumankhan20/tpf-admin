import { apiSlice } from "./apiSlice";

export const organizationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllOrganizations: builder.query({
            query: (params) => ({
                url: "/organizations",
                params: params,
            }),
            providesTags: ["Organizations"],
        }),
        getOrganizationById: builder.query({
            query: (id) => `/organizations/${id}`,
            providesTags: (result, error, id) => [{ type: "Organizations", id }],
        }),
        updateOrganizationVerificationStatus: builder.mutation({
            query: ({ id, verificationStatus, verificationNotes }) => ({
                url: `/organizations/${id}/verify`,
                method: "PUT",
                body: { verificationStatus, verificationNotes },
            }),
            invalidatesTags: ["Organizations"],
        }),
        updateOrganization: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/organizations/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Organizations"],
        }),
        deleteOrganization: builder.mutation({
            query: (id) => ({
                url: `/organizations/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Organizations"],
        }),
        getOrganizationStats: builder.query({
            query: () => "/organizations/stats",
            providesTags: ["Organizations"],
        }),
        getAllCampaignRequests: builder.query({
            query: () => "/campaign-requests/all",
            providesTags: ["CampaignRequest"],
        }),
        updateCampaignRequestStatus: builder.mutation({
            query: ({ id, status, adminStatement }) => ({
                url: `/campaign-requests/admin/${id}/status`,
                method: "PATCH",
                body: { status, adminStatement },
            }),
            invalidatesTags: ["CampaignRequest", "Campaign", "Fundraiser"],
        }),
    }),
});

export const {
    useGetAllOrganizationsQuery,
    useGetOrganizationByIdQuery,
    useUpdateOrganizationVerificationStatusMutation,
    useUpdateOrganizationMutation,
    useDeleteOrganizationMutation,
    useGetOrganizationStatsQuery,
    useGetAllCampaignRequestsQuery,
    useUpdateCampaignRequestStatusMutation,
} = organizationApiSlice;
