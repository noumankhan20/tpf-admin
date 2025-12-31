import { apiSlice } from './../apiSlice';

export const stockApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInventoryStock: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page);
                if (params?.limit) queryParams.append("limit", params.limit);
                if (params?.search) queryParams.append("search", params.search);
                return `/inventory/stock?${queryParams.toString()}`;
            },
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
