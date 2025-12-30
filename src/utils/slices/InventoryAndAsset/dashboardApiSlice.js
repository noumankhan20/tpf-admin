import { apiSlice } from './../apiSlice';

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInventoryDashboardStats: builder.query({
            query: () => ({
                url: '/inventory/dashboard/stats',
                method: 'GET',
            }),
            providesTags: ['InventoryDashboard', 'Items', 'Stock', 'Purchases', 'Expenses', 'Assets'],
        }),
    }),
});

export const {
    useGetInventoryDashboardStatsQuery,
} = dashboardApiSlice;
