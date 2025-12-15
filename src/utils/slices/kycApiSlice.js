import { apiSlice } from "./apiSlice";

export const kycApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getKycRequests: builder.query({
            query: ({ page = 1, limit = 10, status, search, sortBy, sortOrder }) => {
                const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
                if (status && status !== 'all') params.append("status", status);
                if (search) params.append("search", search);
                return `/admin/kyc/requests?${params.toString()}`;
            },
            providesTags: ["KYCRequests"],
        }),
        updateKycStatus: builder.mutation({
            query: ({ id, status, remarks }) => ({
                url: `/admin/kyc/request/${id}/status`,
                method: "PUT",
                body: { status, remarks },
            }),
            invalidatesTags: ["KYCRequests"],
        }),
    }),
});

export const {
    useGetKycRequestsQuery,
    useUpdateKycStatusMutation,
} = kycApiSlice;
