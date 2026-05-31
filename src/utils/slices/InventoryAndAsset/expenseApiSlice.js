import { apiSlice } from './../apiSlice';

export const expenseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query({
            query: ({ type = 'ALL', search = '', startDate = '', endDate = '' } = {}) => {
                const params = new URLSearchParams();
                if (type && type !== 'ALL') params.append('expenseType', type);
                if (search) params.append('search', search);
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                return {
                    url: `/inventory/expenses?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Expenses'],
        }),
        createExpense: builder.mutation({
            query: (data) => ({
                url: '/inventory/expenses',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Expenses'],
        }),
        updateExpense: builder.mutation({
            query: ({ expenseId, data }) => ({
                url: `/inventory/expenses/${expenseId}`,   // <-- expenseId must be defined
                method: 'PATCH',
                body: data,                                // FormData — RTK handles multipart
            }),
            invalidatesTags: ['Expenses'],
        }),
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `/inventory/expenses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Expenses'],
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
} = expenseApiSlice;
