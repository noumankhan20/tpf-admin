
import { apiSlice } from "./apiSlice";

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardAnalytics: builder.query({
            query: ({ startDate, endDate, campaignId, campaignSearch }) => {
                const params = new URLSearchParams();
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", endDate);
                if (campaignId) params.append("campaignId", campaignId);
                if (campaignSearch) params.append("campaignSearch", campaignSearch);

                return {
                    url: `/admin/dashboard/analytics?${params.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: 300,
        }),
        getCalendarEvents: builder.query({
            query: ({ month, year }) => ({
                url: `/admin/dashboard/calendar-events?month=${month}&year=${year}`,
                method: "GET",
            }),
            providesTags: ["CalendarEvents"],
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
            query: ({ startDate, endDate } = {}) => {
                const params = new URLSearchParams();
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", endDate);
                return {
                    url: `/admin/dashboard/campaign-referrals?${params.toString()}`,
                    method: "GET",
                };
            },
            keepUnusedDataFor: 60,
        }),
        addMeeting: builder.mutation({
            query: (data) => ({
                url: `/admin/dashboard/add-meeting`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["CalendarEvents"],
        }),
    }),
});

export const {
    useGetDashboardAnalyticsQuery,
    useGetCalendarEventsQuery,
    useGetSummaryMetricsQuery,
    useGetDonationAnalyticsQuery,
    useGetActivityHeatmapQuery,
    useGetCampaignReferralsQuery,
    useAddMeetingMutation,
} = adminDashboardApiSlice;

