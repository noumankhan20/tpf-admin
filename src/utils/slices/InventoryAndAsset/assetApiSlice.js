import { apiSlice } from './../apiSlice';

export const assetApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAssets: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page);
                if (params?.limit) queryParams.append("limit", params.limit);
                if (params?.search) queryParams.append("search", params.search);
                if (params?.status) queryParams.append("assetStatus", params.status);
                if (params?.assetStatus) queryParams.append("assetStatus", params.assetStatus);
                if (params?.startDate) queryParams.append("startDate", params.startDate);
                if (params?.endDate) queryParams.append("endDate", params.endDate);
                return `/inventory/assets?${queryParams.toString()}`;
            },
            providesTags: ['Assets'],
        }),
        assignAsset: builder.mutation({
            query: ({ assetId, assignedTo }) => ({
                url: `/inventory/assets/${assetId}/assign`,
                method: 'PUT',
                body: { assignedTo },
            }),
            invalidatesTags: ['Assets', 'Items'],
        }),
        unassignAsset: builder.mutation({
            query: (assetId) => ({
                url: `/inventory/assets/${assetId}/unassign`,
                method: 'PUT',
            }),
            invalidatesTags: ['Assets', 'Items'],
        }),
        updateAssetIncome: builder.mutation({
            query: ({ assetId, ...incomeData }) => ({
                url: `/inventory/assets/${assetId}/income`,
                method: 'PUT',
                body: incomeData,
            }),
            invalidatesTags: ['Assets'],
        }),
        updateAsset: builder.mutation({
            query: ({ assetId, data }) => ({
                url: `/inventory/assets/${assetId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Assets', 'Items'],
        }),
        deleteAsset: builder.mutation({
            query: (assetId) => ({
                url: `/inventory/assets/${assetId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Assets', 'Items'],
        }),
    }),
});

export const {
    useGetAssetsQuery,
    useAssignAssetMutation,
    useUnassignAssetMutation,
    useUpdateAssetIncomeMutation,
    useUpdateAssetMutation,
    useDeleteAssetMutation,
} = assetApiSlice;
