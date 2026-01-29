import { apiSlice } from './apiSlice';

export const vouchersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getVouchers: builder.query({
            query: () => '/vouchers/pending',
            providesTags: ['Vouchers'],
        }),
        updateVoucherStatus: builder.mutation({
            query: ({ id, status, clarificationReason }) => ({
                url: `/vouchers/status/${id}`,
                method: 'PUT',
                body: { status, clarificationReason },
            }),
            invalidatesTags: ['Vouchers', 'Volunteers'],
        }),
        getVolunteers: builder.query({
            query: (params) => ({
                url: '/vouchers/volunteers',
                method: 'GET',
                params
            }),
            providesTags: ['Volunteers'],
        }),
        getVolunteerById: builder.query({
            query: (id) => `/vouchers/volunteers/${id}`,
            providesTags: (result, error, id) => [{ type: 'Volunteers', id }],
        }),
        getApprovedVouchers: builder.query({
            query: (volunteerId) => `/vouchers/approved/${volunteerId}`,
            providesTags: ['Vouchers'],
        }),
    }),
});

export const {
    useGetVouchersQuery,
    useUpdateVoucherStatusMutation,
    useGetVolunteersQuery,
    useGetVolunteerByIdQuery,
    useGetApprovedVouchersQuery,
} = vouchersApiSlice;
