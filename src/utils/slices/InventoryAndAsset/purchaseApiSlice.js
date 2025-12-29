import { apiSlice } from './../apiSlice';

export const purchaseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPurchases: builder.query({
            query: (search) => ({
                url: `/inventory/purchases${search ? `?search=${search}` : ''}`,
                method: 'GET',
            }),
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
    }),
});

export const {
    useGetPurchasesQuery,
    useCreatePurchaseMutation,
} = purchaseApiSlice;
