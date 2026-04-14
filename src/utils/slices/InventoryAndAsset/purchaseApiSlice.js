import { apiSlice } from './../apiSlice';

export const purchaseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPurchases: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page);
                if (params?.limit) queryParams.append("limit", params.limit);
                if (params?.search) queryParams.append("search", params.search);
                if (params?.paymentStatus) queryParams.append("paymentStatus", params.paymentStatus);
                if (params?.vendorId) queryParams.append("vendorId", params.vendorId);
                if (params?.startDate) queryParams.append("startDate", params.startDate);
                if (params?.endDate) queryParams.append("endDate", params.endDate);
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
        updatePurchase: builder.mutation({
            query: ({ id, data }) => ({
                url: `/inventory/purchases/${id}`,
                method: 'PATCH',
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
    useUpdatePurchaseMutation,
    useDeletePurchaseMutation,
} = purchaseApiSlice;
