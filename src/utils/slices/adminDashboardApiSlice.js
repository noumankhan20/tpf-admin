
import { apiSlice } from "./apiSlice";

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCalendarEvents: builder.query({
            query: ({ month, year }) => ({
                url: `/admin/dashboard/calendar-events?month=${month}&year=${year}`,
                method: "GET",
            }),
            keepUnusedDataFor: 300,
        }),
        getSummaryMetrics: builder.query({
            query: () => ({
                url: `/admin/dashboard/summary-metrics`,
                method: "GET",
            }),
            keepUnusedDataFor: 60,
        }),
        getDonationAnalytics: builder.query({
            query: ({ timeRange, month, year, donationType }) => {
                const params = new URLSearchParams();
                if (timeRange) params.append("timeRange", timeRange); // 'today', 'week', 'month', 'year'
                if (month) params.append("month", month);
                if (year) params.append("year", year);
                if (donationType) params.append("donationType", donationType);

                return {
                    url: `/admin/dashboard/donation-analytics?${params.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: 300,
        }),
        getActivityHeatmap: builder.query({
            query: () => ({
                url: `/admin/dashboard/activity-heatmap`,
                method: "GET",
            }),
            keepUnusedDataFor: 300,
        }),
        getCampaignReferrals: builder.query({
            query: () => ({
                url: `/admin/dashboard/campaign-referrals`,
                method: "GET",
            }),
            keepUnusedDataFor: 60,
        }),
    }),
});

export const {
    useGetCalendarEventsQuery,
    useGetSummaryMetricsQuery,
    useGetDonationAnalyticsQuery,
    useGetActivityHeatmapQuery,
    useGetCampaignReferralsQuery,
} = adminDashboardApiSlice;
