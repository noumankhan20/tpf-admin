import { apiSlice } from './../apiSlice';

export const expenseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query({
            query: ({ type, search } = {}) => {
                const params = new URLSearchParams();
                if (type && type !== 'ALL') params.append('expenseType', type);
                if (search) params.append('search', search);
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
    }),
});

export const {
    useGetExpensesQuery,
    useCreateExpenseMutation,
} = expenseApiSlice;
