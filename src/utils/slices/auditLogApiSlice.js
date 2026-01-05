
import { apiSlice } from "./apiSlice";

export const auditLogApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAuditLogs: builder.query({
            query: () => `/audit-logs`,
            providesTags: ["AuditLog"],
        }),
        createAuditLog: builder.mutation({
            query: (data) => ({
                url: `/audit-logs/create`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["AuditLog"],
        }),
    }),
});

export const { useGetAuditLogsQuery, useCreateAuditLogMutation } = auditLogApiSlice;
