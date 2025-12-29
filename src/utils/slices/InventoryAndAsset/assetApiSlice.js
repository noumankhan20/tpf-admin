import { apiSlice } from './../apiSlice';

export const assetApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAssets: builder.query({
            query: () => ({
                url: '/inventory/assets',
                method: 'GET',
            }),
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
    }),
});

export const {
    useGetAssetsQuery,
    useAssignAssetMutation,
    useUnassignAssetMutation,
    useUpdateAssetIncomeMutation,
} = assetApiSlice;
