import { apiSlice } from './../apiSlice';

export const assetApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAssets: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page);
                if (params?.limit) queryParams.append("limit", params.limit);
                if (params?.search) queryParams.append("search", params.search);
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
            query: ({ assetId, monthlyIncome }) => ({
                url: `/inventory/assets/${assetId}/income`,
                method: 'PUT',
                body: { monthlyIncome },
            }),
            invalidatesTags: ['Assets'],
        }),
        deleteAsset: builder.mutation({
            query: (id) => ({
                url: `/inventory/assets/${id}`,
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
    useDeleteAssetMutation,
} = assetApiSlice;
