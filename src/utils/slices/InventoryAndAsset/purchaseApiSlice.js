import { apiSlice } from './../apiSlice';

export const purchaseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPurchases: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page);
                if (params?.limit) queryParams.append("limit", params.limit);
                if (params?.search) queryParams.append("search", params.search);
                return `/inventory/purchases?${queryParams.toString()}`;
            },
            providesTags: ['Purchases'],
        }),
        createPurchase: builder.mutation({
            query: (data) => ({
                url: '/inventory/purchases',
                method: 'POST',
                body: data, // data should be FormData
            }),
            invalidatesTags: ['Purchases', 'Stock', 'Items'],
        }),
        deletePurchase: builder.mutation({
            query: (id) => ({
                url: `/inventory/purchases/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Purchases', 'Stock', 'Items'],
        }),
    }),
});

export const {
    useGetPurchasesQuery,
    useCreatePurchaseMutation,
    useDeletePurchaseMutation,
} = purchaseApiSlice;
