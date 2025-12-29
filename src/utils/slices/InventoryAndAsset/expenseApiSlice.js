import { apiSlice } from './../apiSlice';

export const expenseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query({
            query: (search) => ({
                url: `/inventory/expenses${search ? `?search=${search}` : ''}`,
                method: 'GET',
            }),
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
