
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
    }),
});

export const { useGetCalendarEventsQuery } = adminDashboardApiSlice;
