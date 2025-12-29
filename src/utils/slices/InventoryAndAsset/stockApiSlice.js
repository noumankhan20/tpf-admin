import { apiSlice } from './../apiSlice';

export const stockApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInventoryStock: builder.query({
            query: (search) => ({
                url: `/inventory/stock${search ? `?search=${search}` : ''}`,
                method: 'GET',
            }),
            providesTags: ['Stock'],
        }),
        distributeStock: builder.mutation({
            query: (data) => ({
                url: '/inventory/stock/distribute',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Stock', 'Items'],
        }),
    }),
});

export const {
    useGetInventoryStockQuery,
    useDistributeStockMutation,
} = stockApiSlice;
